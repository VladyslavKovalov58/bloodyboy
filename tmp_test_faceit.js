const API_KEY = '8c6fc8a3-0b4b-46f8-9d4a-48a7481b643c';
const ID = '70adb9b2-018d-428b-be81-104d48b898ba';

async function test() {
    console.log(`Testing ID: ${ID}`);

    const endpoints = [
        `https://open.faceit.com/data/v4/championships/${ID}`,
        `https://open.faceit.com/data/v4/tournaments/${ID}`,
        `https://open.faceit.com/data/v4/championships/${ID}/subscriptions`
    ];

    for (const url of endpoints) {
        console.log(`Trying ${url}...`);
        try {
            const resp = await fetch(url, {
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
            });
            console.log(`Status: ${resp.status} ${resp.statusText}`);
            if (resp.ok) {
                const data = await resp.json();
                console.log(`Success! Name: ${data.name || data.nickname || 'N/A'}`);
                if (data.items) console.log(`Items count: ${data.items.length}`);
            } else {
                const err = await resp.text();
                // console.log(`Error body: ${err}`);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
}

test();
