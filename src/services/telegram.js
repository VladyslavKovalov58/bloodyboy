const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
import { supabase } from '../supabaseClient';

export const getTelegramBotInfo = async () => {
    if (!TELEGRAM_BOT_TOKEN) return null;
    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
        const data = await res.json();
        return data.result || null;
    } catch {
        return null;
    }
};

/**
 * Sends a message to a Telegram user
 * @param {string} chatId - Telegram chat ID
 * @param {string} text - Message text (Markdown supported)
 */
export const sendTelegramMessage = async (chatId, text) => {
    if (!TELEGRAM_BOT_TOKEN) {
        console.error('Telegram Bot Token is not configured');
        return false;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            }),
        });

        const data = await response.json();
        return data.ok;
    } catch (error) {
        console.error('Telegram API Error:', error);
        return false;
    }
};

/**
 * Mass notify all Telegram subscribers of a tournament
 */
export const sendTelegramTournamentReminder = async (tournamentId, tournamentTitle, customMessage = null) => {
    try {
        const { data: subs, error } = await supabase
            .from('tournament_subscriptions')
            .select('telegram_user_id')
            .eq('tournament_id', tournamentId)
            .not('telegram_user_id', 'is', null);

        if (error) throw error;
        if (!subs || subs.length === 0) return { success: true, count: 0 };

        let baseUrl = window.location.origin;
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = 'https://bloodyboy.top'; // To make links clickable in Telegram during local development
        }
        const tournamentUrl = `${baseUrl}/tournaments/${tournamentId}`;

        const text = customMessage
            ? `🗣 *${tournamentTitle}*\n\n${customMessage}\n\n👉 [Перейти к турниру](${tournamentUrl})`
            : `🏆 *${tournamentTitle}*\n\n⏳ *Напоминание: Турнир скоро начнется!*\nПодготовься, зайди в Discord и на Faceit.\n\n👉 [Перейти к турниру](${tournamentUrl})`;

        let successCount = 0;
        for (const sub of subs) {
            const success = await sendTelegramMessage(sub.telegram_user_id, text);
            if (success) successCount++;
        }

        return { success: true, count: successCount, total: subs.length };
    } catch (error) {
        console.error('Telegram Mass Notify Error:', error);
        return { success: false, error: error.message };
    }
};
