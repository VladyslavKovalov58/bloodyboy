-- Обеспечим наличие расширения для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Удалим таблицы, чтобы гарантированно обновить схему (кроме site_config, чтобы не терять ссылки)
-- При удалении таблицы все её политики удаляются автоматически
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS bonuses CASCADE;

-- Для site_config удаляем политики только если таблица существует
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'site_config') THEN
        DROP POLICY IF EXISTS "Allow public read on site_config" ON site_config;
        DROP POLICY IF EXISTS "Allow authenticated changes on site_config" ON site_config;
    END IF;
END $$;

-- Таблица для глобальных настроек (ссылки и т.д.)
CREATE TABLE IF NOT EXISTS site_config (
    id TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Начальные данные
INSERT INTO site_config (id, value, description) VALUES
('tg_group', 'https://t.me/bloodyboy58', 'Ссылка на Telegram группу/канал (Личная)'),
('tg_chat', 'https://t.me/+7b4HEtKQoqBkMzgy', 'Ссылка на Telegram чат (Личный)'),
('community_tg', 'https://t.me/tigercasinoofficial', 'Ссылка на Telegram группу (Сообщество)'),
('kick_link', 'https://kick.com/bloodyboy58', 'Ссылка на Kick (Личный)'),
('discord_link', 'https://discord.gg/gTkYrBDf', 'Ссылка на Discord (Сообщество)'),
('faceit_link', 'https://www.faceit.com/ru/club/44e432a6-3d12-49b8-b591-8b4f820e5d9e/parties', 'Ссылка на Faceit Hub (Сообщество)')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

-- Таблица для бонусов казино
CREATE TABLE IF NOT EXISTS bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT NOT NULL,
    offer TEXT,
    promo TEXT,
    link TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Политики для бонусов
DROP POLICY IF EXISTS "Allow public read on bonuses" ON bonuses;
DROP POLICY IF EXISTS "Allow authenticated changes on bonuses" ON bonuses;
ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on bonuses" ON bonuses FOR SELECT USING (true);
CREATE POLICY "Allow authenticated changes on bonuses" ON bonuses FOR ALL USING (auth.role() = 'authenticated');

-- Таблица для турниров
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    target_date TIMESTAMP WITH TIME ZONE,
    prize_pool TEXT,
    format TEXT,
    type TEXT DEFAULT 'FUN CUP',
    joined_count TEXT,
    image_url TEXT,
    link TEXT,
    brief_description TEXT,
    full_description TEXT,
    rules TEXT,
    sponsor_name TEXT,
    sponsor_icon TEXT,
    sponsor_link TEXT,
    winner_1 TEXT,
    winner_1_prize TEXT,
    winner_2 TEXT,
    winner_2_prize TEXT,
    winner_3 TEXT,
    winner_3_prize TEXT,
    is_active BOOLEAN DEFAULT true,
    faceit_id TEXT,
    faceit_sync_enabled BOOLEAN DEFAULT false,
    map_pool TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Включаем RLS
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Политики доступа
CREATE POLICY "Allow public read on site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow authenticated changes on site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read on tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated changes on tournaments" ON tournaments FOR ALL USING (auth.role() = 'authenticated');

-- Начальные данные для турниров (пример)
INSERT INTO tournaments (title, date, target_date, prize_pool, format, is_active, image_url, link, brief_description, full_description, rules, sponsor_name, sponsor_icon, sponsor_link)
VALUES (
    'TIGER Wingmans Tournament', 
    '27.03.2026', 
    '2026-03-27T18:00:00', 
    '$1,500', 
    'Wingmans', 
    true, 
    'https://i.ibb.co/LzNfS6Pq/image.png', 
    'https://www.faceit.com/ru/championship/70adb9b2-018d-428b-be81-104d48b898ba/Tiger%2520Wingmans%2520Cup',
    'TIGER Wingmans Cup - захватывающий турнир 2x2 с призовым фондом $1,500!',
    'Добро пожаловать в TIGER Wingmans Tournament — место, где даже самые тихие тигры становятся настоящими охотниками на поле боя! 🐅

Возьмите напарника, включайте Faceit и голосовой чат Discord — пора показать, кто здесь настоящий король джунглей.',
    '1. Все участники должны находиться в голосовом чате нашего Discord во время матчей.
2. Турнир проводится исключительно на платформе Faceit.
3. Запрещены любые договорные матчи, читинг и неспортивное поведение. Нарушители будут немедленно дисквалифицированы.
4. Участники обязаны соблюдать правила Faceit и правила честной игры.
5. Решения организаторов являются окончательными.',
    'Tiger Casino',
    'https://tgrcas.org/icon%20copy%20copy.svg',
    'https://tgr.casino/'
) ON CONFLICT DO NOTHING;

-- Начальные данные для бонусов
INSERT INTO bonuses (site_name, offer, promo, link, color, order_index)
VALUES 
('TIGER', '100% к депозиту', 'Бонус на первый депозит', 'https://tgr.casino/', 'linear-gradient(135deg, #FF9500 0%, #FF5E00 100%)', 1),
('CACTUS', '150% + 100 FS', 'Промокод: BLOODYBOY', 'https://lacoberturayanet.xyz/affiliate/c_xfq4ik86', '#00D100', 2),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 3),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 4),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 5),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 6),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 7),
('Скоро...', 'Новые бонусы', '—', '#', '#333333', 8)
ON CONFLICT DO NOTHING;

-- МИГРАЦИЯ: Если у вас уже есть таблицы, выполните эти команды в SQL Editor:
-- ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS map_pool TEXT;
-- ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS brief_description_en TEXT;
-- ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS full_description_en TEXT;
-- ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS rules_en TEXT;
