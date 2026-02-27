const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
const DISCORD_RESULTS_WEBHOOK_URL = import.meta.env.VITE_DISCORD_RESULTS_WEBHOOK_URL;

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
