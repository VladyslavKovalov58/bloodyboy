const https = require('https');
const fs = require('fs');

const key = fs.readFileSync('.env', 'utf-8').match(/VITE_FACEIT_API_KEY=(.*)/)[1].trim();

https.get('https://open.faceit.com/data/v4/championships/bd1a9a0e-9c21-4caa-b279-a74abd08fb91/matches?type=past&offset=0&limit=5', {
    headers: { 'Authorization': 'Bearer ' + key }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(JSON.stringify(JSON.parse(body), null, 2)));
}).on('error', console.error);
