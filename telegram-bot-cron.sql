-- Включаем необходимые расширения Supabase (pg_net для запросов, pg_cron для таймера)
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Создаем расписание (каждые 10 минут)
select cron.schedule(
  'telegram-reminders', -- Название задачи
  '*/10 * * * *',       -- Как часто запускать: каждые 10 минут
  $$
    DO $block$
    DECLARE
        t RECORD;
        sub RECORD;
        bot_token TEXT := '8181133172:AAF5KUwMC5X7CsIFMMb96V92t46RJ8wZ818'; -- Твой токен
        msg_text TEXT;
        payload JSONB;
    BEGIN
        -- Находим все активные турниры, до начала которых осталось от 115 до 125 минут (~2 часа)
        FOR t IN 
            SELECT id, title
            FROM tournaments
            WHERE is_active = true 
              AND NULLIF(target_date, '') IS NOT NULL
              -- target_date обычно хранится как строка ISO или timestamp. Приводим к timestamptz.
              AND target_date::timestamptz >= now() + interval '115 minutes'
              AND target_date::timestamptz <= now() + interval '125 minutes'
        LOOP
            -- Формируем красивый текст сообщения
            msg_text := '🏆 *' || t.title || '*' || chr(10) || chr(10) || 
                        '⏳ *Напоминание: Турнир начинается примерно через 2 часа!*' || chr(10) || 
                        'Подготовься, зайди в Discord и на Faceit.' || chr(10) || chr(10) || 
                        '👉 [Перейти к турниру](https://bloodyboy.top/tournaments/' || t.id || ')';

            -- Находим всех подписчиков этого турнира
            FOR sub IN
                SELECT telegram_user_id
                FROM tournament_subscriptions
                WHERE tournament_id = t.id
                  AND telegram_user_id IS NOT NULL
            LOOP
                -- Формируем тело запроса для Telegram API
                payload := json_build_object(
                    'chat_id', sub.telegram_user_id,
                    'text', msg_text,
                    'parse_mode', 'Markdown'
                )::jsonb;

                -- Отправляем асинхронный POST-запрос через pg_net (работает в фоне, не нагружает БД)
                PERFORM net.http_post(
                    url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
                    body := payload,
                    headers := '{"Content-Type": "application/json"}'::jsonb
                );
            END LOOP;
        END LOOP;
    END;
    $block$;
  $$
);
