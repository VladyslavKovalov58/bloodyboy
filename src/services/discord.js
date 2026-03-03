import { supabase } from '../supabaseClient';
const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESULTS_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESULTS_WEBHOOK_URL;
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN;

/**
 * Sends a tournament notification to Discord
 * @param {Object} tournament - The tournament object from the database
 * @returns {Promise<boolean>} - Success state
 */
export const sendTournamentToDiscord = async (tournament) => {
    if (!DISCORD_WEBHOOK_URL) {
        console.error('Discord Webhook URL is not configured in .env');
        return false;
    }

    // Determine the base URL for the site (defaulting to the current origin if possible)
    const baseUrl = window.location.origin;
    const tournamentUrl = `${baseUrl}/tournaments/${tournament.id}`;

    const embed = {
        title: `🏆 ${tournament.title.toUpperCase()}`,
        color: 0xFF6B00, // primary-orange hex
        description: [
            '',
            `💰 Призовой фонд: ${tournament.prize_pool || 'TBA'}`,
            `🎮 Формат: ${tournament.format || 'TBA'}`,
            `🕹️ Платформа: Faceit`,
            `📅 Дата: ${tournament.date || 'TBA'}`,
            '',
            `🔗 [Перейти на сайт](${tournamentUrl})`
        ].join('\n'),
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Tiger Tournaments',
            icon_url: 'https://i.ibb.co/mGK69Ff/tiger-icon.png'
        }
    };

    if (tournament.image_url) {
        embed.image = { url: tournament.image_url };
    }

    return await postToWebhook(DISCORD_WEBHOOK_URL, embed);
};

/**
 * Sends tournament results to a dedicated Discord channel
 * @param {Object} tournament - The tournament object from the database
 * @returns {Promise<boolean>} - Success state
 */
export const sendTournamentResultsToDiscord = async (tournament) => {
    if (!DISCORD_RESULTS_WEBHOOK_URL) {
        console.error('Discord Results Webhook URL is not configured in .env');
        return false;
    }

    const baseUrl = window.location.origin;
    const tournamentUrl = `${baseUrl}/tournaments/${tournament.id}`;

    const winnersContent = [
        `🏆 **${tournament.title.toUpperCase()}**`,
        '',
        'Поздравляем победителей турнира! 🥳',
        '',
        tournament.winner_1 ? `🥇 1 место — **${tournament.winner_1}** — ${tournament.winner_1_prize || ''}` : null,
        tournament.winner_2 ? `🥈 2 место — **${tournament.winner_2}** — ${tournament.winner_2_prize || ''}` : null,
        tournament.winner_3 ? `🥉 3 место — **${tournament.winner_3}** — ${tournament.winner_3_prize || ''}` : null,
        '',
        '',
        `🔗 **[Перейти к турниру](${tournamentUrl})**`
    ].filter(item => item !== null).join('\n');

    const embed = {
        color: 0xFFD700, // Gold color for results
        description: winnersContent,
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Tiger Results',
            icon_url: 'https://i.ibb.co/mGK69Ff/tiger-icon.png'
        }
    };

    if (tournament.image_url) {
        embed.thumbnail = { url: tournament.image_url };
    }

    return await postToWebhook(DISCORD_RESULTS_WEBHOOK_URL, embed);
};

/**
 * Helper function to post to a Discord webhook
 */
const postToWebhook = async (url, embed) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API error: ${response.status} ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        return false;
    }
};

/**
 * Sends a Direct Message to a Discord user via the Supabase Edge Function
 */
export const sendDMToUser = async (userId, content, embed = null) => {
    try {
        const { data, error } = await supabase.functions.invoke('send-discord-dm', {
            body: { userId, content, embed }
        });

        if (error) {
            console.error(`Edge Function Error for user ${userId}:`, error);
            return false;
        }

        if (data && data.error) {
            console.error(`Discord API Error via Edge Function for user ${userId}:`, data.error);
            return false;
        }

        return true;
    } catch (error) {
        console.error(`Critical error sending DM to user ${userId}:`, error);
        return false;
    }
};

/**
 * Mass notify all subscribers of a tournament
 */
export const sendTournamentReminderToSubscribers = async (tournamentId, tournamentTitle) => {
    try {
        // Fetch subscribers
        const { data: subs, error } = await supabase
            .from('tournament_subscriptions')
            .select('discord_user_id')
            .eq('tournament_id', tournamentId);

        if (error) throw error;
        if (!subs || subs.length === 0) return { success: true, count: 0 };

        const baseUrl = window.location.origin;
        const tournamentUrl = `${baseUrl}/tournaments/${tournamentId}`;

        const embed = {
            title: `🔔 НАПОМИНАНИЕ: ${tournamentTitle.toUpperCase()}`,
            description: `Турнир скоро начнется! Подготовься и заходи на Faceit.\n\n🔗 **[Окрыть страницу турнира](${tournamentUrl})**`,
            color: 0xFFB400,
            timestamp: new Date().toISOString(),
            footer: { text: 'BloodyBoy Tournaments' }
        };

        let successCount = 0;
        for (const sub of subs) {
            const success = await sendDMToUser(sub.discord_user_id, `Привет! Напоминание о турнире **${tournamentTitle}**! 🎮`, embed);
            if (success) successCount++;
        }

        return { success: true, count: successCount, total: subs.length };
    } catch (error) {
        console.error('Mass notification error:', error);
        return { success: false, error: error.message };
    }
};
