const https = require('https');
const fs = require('fs');

const key = fs.readFileSync('.env', 'utf-8').match(/VITE_FACEIT_API_KEY=(.*)/)[1].trim();

https.get('https://open.faceit.com/data/v4/matches/1-cc3e5645-ed79-4117-a225-7799ebea328e/stats', {
    headers: { 'Authorization': 'Bearer ' + key }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(JSON.stringify(JSON.parse(body), null, 2)));
}).on('error', console.error);
