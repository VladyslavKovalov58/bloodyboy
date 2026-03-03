import { getTelegramBotInfo } from './src/services/telegram.js';
import { fetchChampionshipDetails } from './src/services/faceit.js';
import dotenv from 'dotenv';
dotenv.config();

// Since this is a Node execution, we have to mock import.meta.env
globalThis.import = { meta: { env: process.env } };

async function test() {
    console.log("Testing Telegram...");
    const info = await getTelegramBotInfo();
    console.log("Telegram Bot Info:", info);

    console.log("Testing Faceit...");
    const faceit = await fetchChampionshipDetails({ id: '82c0b431-1ba0-42cf-bd0e-11fcf4e36d40' });
    console.log("Faceit match:", faceit);
}

test();
