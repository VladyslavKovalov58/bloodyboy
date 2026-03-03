const API_URL = 'https://open.faceit.com/data/v4';
const API_KEY = import.meta.env.VITE_FACEIT_API_KEY?.trim() || '8c6fc8a3-0b4b-46f8-9d4a-48a7481b643c';

// Cache to remember if an ID is a championship or a tournament to avoid 404 errors
const typeCache = {};

const processCompetitionData = (data) => {
    if (!data || typeof data !== 'object') return data;

    // Robust slots detection
    const max = data.slots || data.max_slots || data.slots_total || data.total_slots || data.max_participants || data.size || data.number_of_players || 32;
    const joined = Math.max(
        0,
        data.slots_filled || 0,
        data.slots_total_filled || 0,
        data.subscriptions_count || 0,
        data.current_subscription_count || 0,
        data.total_subscriptions || 0,
        data.members_count || 0,
        data.total_members || 0,
        data.member_count || 0,
        data.joined || 0,
        data.teams_count || 0,
        data.total_teams || 0,
        data.registered_teams || 0,
        data.participant_count || 0,
        data.number_of_players_joined || 0,
        data.number_of_players_participants || 0
    );

    // Robust team size detection
    let teamSize = data.game_settings?.team_size || data.game_configuration?.team_size || data.team_size;
    const name = (data.name || '').toLowerCase();
    const gameId = (data.game_id || data.faceit_game_id || '').toLowerCase();

    if (!teamSize) {
        if (name.includes('wingman') || name.includes('2v2') || name.includes('2x2') || gameId.includes('wingman')) teamSize = 2;
        else if (name.includes('1v1') || name.includes('solo')) teamSize = 1;
        else teamSize = 5;
    }

    // Bracket sizes usually don't need division (64, 128, 256, 512, 1024)
    const isStandardBracket = [64, 128, 256, 512, 1024].includes(Number(max));

    if (teamSize >= 2 && max > 32 && max % teamSize === 0 && !isStandardBracket) {
        data.slots = max / teamSize;
        data.slots_filled = Math.ceil(joined / teamSize);
    } else {
        data.slots = max;
        data.slots_filled = joined;
    }
    data.slots_total = data.slots;

    return data;
};

// Helper to automatically try both championship and tournament endpoints
const tryAllEndpoints = async (championshipId, resourcePath = '', queryParams = '', searchSlug = null, forcedType = null) => {
    if (!API_KEY) return null;

    const id = (searchSlug || championshipId || '').trim();
    if (!id) return null;

    const cachedType = typeCache[id];
    const endpoints = forcedType ? [forcedType] : (cachedType ? [cachedType] : ['championships', 'tournaments']);

    // 1. Silent Probe via Search API (Only for full details call)
    // Only search by name if it doesn't look like a UUID
    const isUuid = /^[a-f0-9-]{36}$/i.test(id);
    if (!resourcePath && !cachedType && !forcedType && !isUuid) {
        try {
            const searchResp = await fetch(`${API_URL}/search/championships?name=${encodeURIComponent(id)}&limit=1`, {
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
            });
            if (searchResp.ok) {
                const searchData = await searchResp.json();
                if (searchData.items && searchData.items.length > 0) {
                    const found = searchData.items[0];
                    const realId = found.championship_id || found.competition_id || found.id;
                    const detectedType = found.competition_type === 'championship' ? 'championships' : 'tournaments';

                    typeCache[id] = detectedType;
                    typeCache[realId] = detectedType;

                    const probeList = [detectedType, ...['championships', 'tournaments'].filter(e => e !== detectedType)];

                    for (const type of probeList) {
                        try {
                            const fullResp = await fetch(`${API_URL}/${type}/${realId}`, {
                                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
                            });
                            if (fullResp.ok) {
                                let data = await fullResp.json();
                                if (data) {
                                    typeCache[id] = type;
                                    typeCache[realId] = type;
                                    data = processCompetitionData(data);
                                }
                                return data;
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (e) { }
    }

    // 2. Direct Probe (Fallback or for sub-resources like /matches)
    for (const type of endpoints) {
        try {
            const url = `${API_URL}/${type}/${id}${resourcePath ? `/${resourcePath}` : ''}${queryParams ? `?${queryParams}` : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
            });
            if (response.ok) {
                let data = await response.json();
                if (data) {
                    if (!resourcePath) {
                        typeCache[id] = type;
                        data = processCompetitionData(data);
                    }
                }
                return data;
            }
        } catch (error) { }
    }

    return null;
};

export const fetchChampionshipDetails = async (idOrObj) => {
    let id = idOrObj;
    let slug = null;
    let type = null;

    if (typeof idOrObj === 'object' && idOrObj !== null) {
        id = idOrObj.id;
        slug = idOrObj.slug;
        type = idOrObj.type;
    }
    return await tryAllEndpoints(id, '', '', slug, type);
};

export const fetchChampionshipMatches = async (idOrObj, limit = 100) => {
    const id = typeof idOrObj === 'object' ? idOrObj?.id : idOrObj;
    const type = typeof idOrObj === 'object' ? idOrObj?.type : null;
    return await tryAllEndpoints(id, 'matches', `limit=${limit}`, null, type);
};

export const fetchChampionshipResults = async (idOrObj) => {
    const id = typeof idOrObj === 'object' ? idOrObj?.id : idOrObj;
    const type = typeof idOrObj === 'object' ? idOrObj?.type : null;
    return await tryAllEndpoints(id, 'results', '', null, type);
};

export const fetchChampionshipParticipants = async (idOrObj, maxLimit = 1500) => {
    const id = typeof idOrObj === 'object' ? idOrObj?.id : idOrObj;
    const type = typeof idOrObj === 'object' ? idOrObj?.type : null;

    const fetchAllPages = async (resource) => {
        let allItems = [];
        let offset = 0;
        const limit = 50; // Ask for 50, but faceit might only give 10

        while (allItems.length < maxLimit) {
            const data = await tryAllEndpoints(id, resource, `offset=${offset}&limit=${limit}`, null, type);
            if (!data) break;

            const items = data.items || [];
            if (items.length === 0) break;

            allItems.push(...items);
            offset += items.length; // Increase offset by actual returned item count

            if (items.length < limit && items.length < 10) {
                // Faceit caps at 10, so if it's less than 10, we know we hit the end
                break;
            }
            if (data.end >= data.total) { // sometimes total is returned
                // break;
            }
            // Stop early to prevent infinite loops if something goes wrong
            if (offset >= maxLimit) break;
        }
        return { items: allItems };
    };

    // Try subscriptions first to avoid 404 errors in console
    let subData = await fetchAllPages('subscriptions');
    let teamData = { items: [] };

    // If subscriptions is empty, it might be a tournament that uses 'teams'
    if (subData.items.length === 0) {
        teamData = await fetchAllPages('teams');
    }

    const items = [];
    const seenIds = new Set();

    const addItems = (source) => {
        if (!source) return;
        const sourceItems = source?.items || (Array.isArray(source) ? source : []);
        sourceItems.forEach(item => {
            if (!item) return;
            const teamId = item.team_id || item.team?.team_id || item.id;
            if (teamId && !seenIds.has(teamId)) {
                seenIds.add(teamId);
                items.push(item);
            }
        });
    };

    addItems(subData);
    addItems(teamData);

    return {
        items,
        total: Math.max(items.length, subData?.total || 0, teamData?.total || 0)
    };
};

export const extractChampionshipId = (url) => {
    if (!url) return null;

    const uuidMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    const parts = url.split('/');

    let type = null;
    const champIdx = parts.findIndex(p => {
        const lower = p.toLowerCase();
        if (lower.includes('championship')) { type = 'championships'; return true; }
        if (lower.includes('tournament')) { type = 'tournaments'; return true; }
        return false;
    });

    let id = uuidMatch ? uuidMatch[1] : null;
    let slug = null;

    if (champIdx !== -1 && parts[champIdx + 1]) {
        const potentialId = parts[champIdx + 1];
        if (!id) id = potentialId;

        if (parts[champIdx + 2]) {
            slug = decodeURIComponent(parts[champIdx + 2]).replace(/%20/g, ' ');
        } else if (!potentialId.match(/^[a-f0-9-]{36}$/i)) {
            slug = decodeURIComponent(potentialId).replace(/%20/g, ' ');
        }
    }
    return { id, slug, type };
};

export const fetchMatchDetails = async (matchId) => {
    if (!API_KEY) return null;
    try {
        const url = `${API_URL}/matches/${matchId}`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};

export const fetchMatchStats = async (matchId) => {
    if (!API_KEY) return null;
    try {
        const url = `${API_URL}/matches/${matchId}/stats`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
};
