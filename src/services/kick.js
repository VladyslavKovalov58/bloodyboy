export const checkKickStatus = async (username = 'bloodyboy58') => {
    // We try multiple endpoints to bypass potential blocks or API changes
    const endpoints = [
        `/api/kick/channels/${username}`,
        `/api/kick-v2/channels/${username}`
    ];

    for (const url of endpoints) {
        try {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                console.log(`Kick check successful (${url}):`, data);

                // In v1, data.livestream is the object. In v2 it might be slightly different.
                // Usually v1 is: { livestream: { id: ..., ... } } or { livestream: null }
                return !!data.livestream;
            } else {
                console.warn(`Kick endpoint ${url} returned status ${response.status}`);
            }
        } catch (error) {
            console.error(`Error checking Kick status at ${url}:`, error);
        }
    }

    // Fallback if both fail but we want to avoid showing offline if we can't be sure?
    // Actually, user wants it to be active if online. If we return false, it shows offline.
    return false;
};
