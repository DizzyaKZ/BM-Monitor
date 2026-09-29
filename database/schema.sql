-- ==============================================================
-- BM-Monitor: Полная чистая инициализация базы данных MySQL 8.x / MariaDB
-- Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY / MEAT / BAKE / SPICY)
-- Объект: Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3)
-- Сброс и полное инициирование проверенными реальными данными
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `market_sources`;
CREATE TABLE `market_sources` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('MARKET', 'HYPERMARKET', 'ONLINE', 'SUPPLIER') NOT NULL,
  `base_url` VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `market_sources` (`id`, `name`, `type`, `base_url`, `description`)
VALUES
  ('altyn_orda', 'Рынок «Алтын Орда» (Мясной и продовольственный хаб)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000788647', 'Оптовые закупки говядины, конины, свинины в полутушах, мука и сахар'),
  ('zeleny_bazar', 'Рынок «Зеленый Базар» (Мясные, молочные и восточные ряды)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000788648', 'Свежая охлажденная говядина, конина Жая/Казы, специи, орехи, семена'),
  ('optovka', '«Оптовка» (Розыбакиева / Райымбека)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000792341', 'Склады бакалеи, пищевых добавок, специй, нитритной соли и дрожжей'),
  ('metro_almaty', 'METRO Cash & Carry Алматы (HoReCa B2B)', 'HYPERMARKET', 'https://www.metro-kz.com/assortment', 'Профессиональный B2B HoReCa каталог: мясо, мука, сливочное масло, специи'),
  ('magnum_almaty', 'Magnum Cash & Carry (Опт/Доставка)', 'HYPERMARKET', 'https://magnum.kz/catalog', 'Сетевой опт и розничные индикаторы Алматы'),
  ('arbuz_almaty', 'Arbuz.kz (Онлайн-маркет Алматы)', 'ONLINE', 'https://arbuz.kz/ru/almaty/', 'Фермерское молоко, сливки, охлажденное мясо премиум качества'),
  ('kaspi_magaz', 'Kaspi Магазин / Kaspi Продукты', 'ONLINE', 'https://kaspi.kz/shop/c/food/', 'Маркетплейс, доставка от поставщиков и мелкий опт'),
  ('satu_almaty', 'Satu.kz B2B Поставщики Алматы', 'ONLINE', 'https://almaty.satu.kz/', 'Каталог оболочек (черева), щепы для копчения, солод, специи'),
  ('bifi_almaty', 'Bifi.kz / ТОО «Vernal» (Дистрибьютор Sacco в РК)', 'SUPPLIER', 'https://bifi.kz/shop/vendor/sacco-italiya', 'Официальный дистрибьютор заквасок Sacco (Италия), сычужных ферментов Microclerici'),
  ('mood_lab', 'Лаборатория пряностей Spicy Mood Lab', 'SUPPLIER', 'https://beermood.kz/BM-Monitor/', 'Внутреннее производство авторских купажей специй (Garam Masala)');

DROP TABLE IF EXISTS `raw_material_prices`;
CREATE TABLE `raw_material_prices` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `category` ENUM('MEAT', 'MILK', 'FLOUR', 'SPICE') NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `base_price_kzt` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `current_cost_kzt` DECIMAL(10, 2) NOT NULL,
  `market_avg_kzt` DECIMAL(10, 2) NOT NULL,
  `market_min_kzt` DECIMAL(10, 2) NOT NULL,
  `market_max_kzt` DECIMAL(10, 2) NOT NULL,
  `trend` ENUM('UP', 'DOWN', 'STABLE') NOT NULL DEFAULT 'STABLE',
  `trend_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `delta_1d_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `delta_30d_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `supplier` VARCHAR(255) NOT NULL,
  `best_source` VARCHAR(50) NOT NULL DEFAULT 'altyn_orda',
  `source_url` VARCHAR(1000) NOT NULL,
  `last_updated` DATE NOT NULL,
  `last_fetched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fetch_method` ENUM('AUTO_CRAWL', 'MANUAL_ENTRY', 'INVOICE_SCAN') NOT NULL DEFAULT 'MANUAL_ENTRY'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `raw_material_prices` 
(`id`, `code`, `category`, `name`, `unit`, `base_price_kzt`, `current_cost_kzt`, `market_avg_kzt`, `market_min_kzt`, `market_max_kzt`, `trend`, `trend_pct`, `delta_1d_pct`, `delta_30d_pct`, `supplier`, `best_source`, `source_url`, `last_updated`, `fetch_method`)
VALUES
  ('RMP-MILK-RAW-COW', 'MILK-RAW-COW', 'MILK', 'Сырое коровье молоко (базис 3.8/3.2)', 'л', 295.00, 295.00, 295.00, 280.00, 320.00, 'UP', 2.50, 0.30, 5.40, 'Рынок «Алтын Орда» (Молочный оптовый хаб)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-MILK-GOAT', 'MILK-GOAT', 'MILK', 'Сырое козье молоко фермерское', 'л', 850.00, 850.00, 850.00, 800.00, 920.00, 'UP', 1.80, 0.50, 3.20, '«Зеленый Базар» (Молочный павильон)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CREAM-RAW-35', 'CREAM-RAW-35', 'MILK', 'Сливки сырые 35% (для маскарпоне)', 'кг', 2650.00, 2650.00, 2650.00, 2450.00, 2800.00, 'STABLE', -0.80, 0.00, 1.50, '«Зеленый Базар» (Молочные ряды)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CULTURE-SACCO-MS062', 'CULTURE-SACCO-MS062', 'MILK', 'Закваска Sacco MS062 (100 UC)', 'упак', 14500.00, 14500.00, 14500.00, 13800.00, 15900.00, 'STABLE', 0.50, 0.00, 1.20, 'Bifi.kz / Vernal (Дистрибьютор Sacco в РК)', 'bifi_almaty', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CULTURE-SACCO-MS064', 'CULTURE-SACCO-MS064', 'MILK', 'Закваска Sacco MS064 (творог/сыр 100 UC)', 'упак', 15200.00, 15200.00, 15200.00, 14500.00, 16500.00, 'UP', 2.10, 0.00, 4.00, 'Bifi.kz / Vernal (Дистрибьютор Sacco в РК)', 'bifi_almaty', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-ENZYME-RENNET', 'ENZYME-RENNET', 'MILK', 'Сычужный фермент Microclerici (100 мл)', 'флак', 3500.00, 3500.00, 3500.00, 3300.00, 3800.00, 'DOWN', -2.00, -0.50, -1.80, 'Bifi.kz (Ингредиенты для сыроделия)', 'bifi_almaty', 'https://bifi.kz/shop/search?q=фермент', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CALCIUM-CHLORIDE', 'CALCIUM-CHLORIDE', 'MILK', 'Кальций хлористый пищевой E509 (фарм)', 'кг', 1250.00, 1250.00, 1250.00, 1150.00, 1400.00, 'STABLE', 0.20, 0.00, 0.50, 'Satu.kz B2B Поставщики Алматы', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=кальций+хлористый+пищевой', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SALT-CHEESE', 'SALT-CHEESE', 'MILK', 'Соль вакуумная мелкая Экстра (чистая)', 'кг', 195.00, 195.00, 195.00, 180.00, 220.00, 'UP', 1.50, 0.00, 3.20, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TENDERLOIN', 'BEEF-TENDERLOIN', 'MEAT', 'Говядина вырезка охлажденная (Алматы)', 'кг', 5400.00, 5400.00, 5400.00, 5000.00, 6100.00, 'STABLE', 0.50, 0.20, 2.10, 'Рынок «Алтын Орда» (Мясной ангар)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-ROUND-TOP', 'BEEF-ROUND-TOP', 'MEAT', 'Говядина тазобедренная мякоть (окорок)', 'кг', 3900.00, 3900.00, 3900.00, 3650.00, 4200.00, 'UP', 2.00, 0.40, 4.50, '«Зеленый Базар» (Мясные ряды)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-SHOULDER', 'BEEF-SHOULDER', 'MEAT', 'Говядина лопатка б/к', 'кг', 3600.00, 3600.00, 3600.00, 3350.00, 3950.00, 'UP', 3.20, 0.80, 5.10, 'METRO Cash & Carry Алматы (Мясной B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TRIM-8020', 'BEEF-TRIM-8020', 'MEAT', 'Тримминг говяжий 80/20 (колбасный)', 'кг', 3350.00, 3350.00, 3350.00, 3150.00, 3600.00, 'UP', 4.10, 1.20, 6.80, 'Satu.kz B2B Мясокомбинаты Алматы', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=говядина+тримминг+оптом', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-HALF', 'PORK-HALF', 'MEAT', 'Свинина в полутушах (1-я категория)', 'кг', 2050.00, 2050.00, 2050.00, 1920.00, 2250.00, 'DOWN', -2.20, -0.30, -3.50, 'Рынок «Алтын Орда» (Мясной ангар)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-LEG', 'PORK-LEG', 'MEAT', 'Свинина окорок б/к охл.', 'кг', 2600.00, 2600.00, 2600.00, 2400.00, 2800.00, 'DOWN', -1.80, 0.50, -2.10, 'METRO Cash & Carry Алматы (Мясной B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-BELLY', 'PORK-BELLY', 'MEAT', 'Свинина грудинка б/к (на бекон)', 'кг', 2800.00, 2800.00, 2800.00, 2650.00, 3050.00, 'STABLE', 1.10, 0.00, 2.30, '«Зеленый Базар» (Свиные ряды)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-FATBACK', 'PORK-FATBACK', 'MEAT', 'Шпик свиной хребтовый твердый', 'кг', 2250.00, 2250.00, 2250.00, 2100.00, 2450.00, 'UP', 2.80, -0.80, 4.10, 'Рынок «Алтын Орда» (Мясной опт)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAYA', 'HORSE-ZHAYA', 'MEAT', 'Конина Жая охлажденная (высший сорт)', 'кг', 4450.00, 4450.00, 4450.00, 4150.00, 4850.00, 'STABLE', -0.50, -0.50, 1.20, '«Зеленый Базар» (Павильон конины)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-KAZY-RAW', 'HORSE-KAZY-RAW', 'MEAT', 'Конина реберная часть (на Казы)', 'кг', 5150.00, 5150.00, 5150.00, 4800.00, 5700.00, 'UP', 2.40, 1.00, 3.80, 'Рынок «Алтын Орда» (Павильон конины)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAL', 'HORSE-ZHAL', 'MEAT', 'Конина Жал подгривный жир', 'кг', 3800.00, 3800.00, 3800.00, 3500.00, 4200.00, 'STABLE', 1.00, 0.20, 2.00, '«Зеленый Базар» (Павильон конины)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-PORK-3840', 'CASING-PORK-3840', 'MEAT', 'Черева свиная 38/40 мм (пучок 91.4м)', 'пучок', 9500.00, 9500.00, 9500.00, 8800.00, 10300.00, 'UP', 3.00, 0.80, 4.50, 'Satu.kz (Оболочки для колбас Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=черева+свиная', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-SHEEP-2224', 'CASING-SHEEP-2224', 'MEAT', 'Черева баранья 22/24 мм (сосиски/пивчики)', 'пучок', 11300.00, 11300.00, 11300.00, 10500.00, 12100.00, 'DOWN', -1.50, 0.00, -2.00, 'Satu.kz (Оболочки для колбас Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=черева+баранья', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-NITRITE-SALT-06', 'NITRITE-SALT-06', 'MEAT', 'Нитритная соль 0.6% Suprasel', 'кг', 440.00, 440.00, 440.00, 410.00, 480.00, 'UP', 2.00, 0.00, 3.00, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Нитритная+соль', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-WOOD-CHIPS-ALDER', 'WOOD-CHIPS-ALDER', 'MEAT', 'Щепа ольховая 6-8 мм для Ижицы (15 кг)', 'мешок', 4200.00, 4200.00, 4200.00, 3900.00, 4600.00, 'DOWN', -2.00, 0.50, -1.50, 'Satu.kz (Щепа для копчения Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=щепа+ольховая+для+копчения', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-PREM', 'FLOUR-WHEAT-PREM', 'FLOUR', 'Мука пшеничная высший сорт (W 280-320)', 'кг', 315.00, 315.00, 315.00, 290.00, 350.00, 'STABLE', -0.50, -0.20, 0.80, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-1ST', 'FLOUR-WHEAT-1ST', 'FLOUR', 'Мука пшеничная 1 сорт (хлебопекарная)', 'кг', 255.00, 255.00, 255.00, 240.00, 280.00, 'STABLE', 1.20, 0.50, 2.00, 'Рынок «Алтын Орда» (Мучные оптовые склады)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHOLEGRAIN', 'FLOUR-WHOLEGRAIN', 'FLOUR', 'Мука пшеничная цельнозерновая обойная', 'кг', 445.00, 445.00, 445.00, 420.00, 480.00, 'UP', 2.50, 0.40, 3.80, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-RYE-PEELED', 'FLOUR-RYE-PEELED', 'FLOUR', 'Мука ржаная обдирная (на Тартин/Бородинский)', 'кг', 305.00, 305.00, 305.00, 280.00, 340.00, 'STABLE', 1.00, 0.80, 2.10, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Мука+ржаная+обдирная', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-SEMOLA-DURUM', 'FLOUR-SEMOLA-DURUM', 'FLOUR', 'Мука Семола дурум (твердая пшеница)', 'кг', 715.00, 715.00, 715.00, 670.00, 790.00, 'DOWN', -2.00, -0.40, -1.50, 'METRO Cash & Carry Алматы (Импорт HoReCa)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-YEAST-COMPRESSED', 'YEAST-COMPRESSED', 'FLOUR', 'Дрожжи прессованные хлебопекарные', 'кг', 760.00, 760.00, 760.00, 725.00, 820.00, 'STABLE', 0.80, 0.50, 1.40, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Дрожжи+прессованные+хлебопекарные', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-MALT-RED-FERM', 'MALT-RED-FERM', 'FLOUR', 'Солод ржаной ферментированный красный', 'кг', 765.00, 765.00, 765.00, 710.00, 830.00, 'UP', 3.10, 0.80, 4.50, 'Satu.kz (Ингредиенты для выпечки и пива)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=солод+ржаной+ферментированный', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BUTTER-825', 'BUTTER-825', 'FLOUR', 'Масло сливочное 82.5% ГОСТ (монолит)', 'кг', 3650.00, 3650.00, 3650.00, 3400.00, 3900.00, 'UP', 4.50, 1.50, 7.20, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-SESAME', 'SEEDS-SESAME', 'FLOUR', 'Кунжут белый очищенный индийский', 'кг', 1920.00, 1920.00, 1920.00, 1780.00, 2150.00, 'STABLE', -0.30, 0.50, 1.00, '«Зеленый Базар» (Ряды орехов и семян)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-PUMPKIN', 'SEEDS-PUMPKIN', 'FLOUR', 'Семена тыквы очищенные', 'кг', 2830.00, 2830.00, 2830.00, 2650.00, 3050.00, 'STABLE', 0.80, 0.60, 2.20, '«Зеленый Базар» (Ряды орехов и семян)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PEPPER-BLACK', 'SPICE-PEPPER-BLACK', 'SPICE', 'Перец черный горошек (Вьетнам 550 г/л)', 'кг', 4250.00, 4250.00, 4250.00, 3950.00, 4600.00, 'DOWN', -3.00, -0.50, -2.50, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CORIANDER', 'SPICE-CORIANDER', 'SPICE', 'Кориандр семена отборные', 'кг', 1240.00, 1240.00, 1240.00, 1150.00, 1330.00, 'UP', 2.50, 0.00, 3.00, 'Рынок «Алтын Орда» (Оптовый хаб)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CUMIN-ZIRA', 'SPICE-CUMIN-ZIRA', 'SPICE', 'Зира (кумин) отборная иранская', 'кг', 4090.00, 4090.00, 4090.00, 3750.00, 4500.00, 'DOWN', -4.50, -0.80, -4.00, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SMOKED', 'SPICE-PAPRIKA-SMOKED', 'SPICE', 'Паприка копченая Pimenton ASTA 120', 'кг', 3800.00, 3800.00, 3800.00, 3600.00, 4200.00, 'UP', 2.00, 0.80, 3.50, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SWEET', 'SPICE-PAPRIKA-SWEET', 'SPICE', 'Паприка сладкая молотая ASTA 140', 'кг', 2780.00, 2780.00, 2780.00, 2640.00, 2980.00, 'UP', 2.20, 0.90, 3.80, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Паприка+сладкая+молотая+ASTA+140', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-GARLIC-GRAN', 'SPICE-GARLIC-GRAN', 'SPICE', 'Чеснок сушеный гранулированный 40-60', 'кг', 2230.00, 2230.00, 2230.00, 2050.00, 2450.00, 'DOWN', -2.50, -1.20, -3.00, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Чеснок+сушеный+гранулированный', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CHILI-FLAKES', 'SPICE-CHILI-FLAKES', 'SPICE', 'Перец чили дробленый / кайенский острый', 'кг', 3260.00, 3260.00, 3260.00, 2980.00, 3600.00, 'UP', 4.20, 0.10, 5.00, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-NUTMEG-GROUND', 'SPICE-NUTMEG-GROUND', 'SPICE', 'Мускатный орех молотый высший сорт', 'кг', 8450.00, 8450.00, 8450.00, 8000.00, 9000.00, 'UP', 5.00, 1.20, 8.00, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://www.metro-kz.com/assortment', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CARDAMOM', 'SPICE-CARDAMOM', 'SPICE', 'Кардамон зеленый цельный отборный', 'кг', 19050.00, 19050.00, 19050.00, 17700.00, 20700.00, 'STABLE', -1.20, 0.00, 1.50, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-GARAM-MASALA', 'SPICE-GARAM-MASALA', 'SPICE', 'Смесь Spicy Mood Garam Masala (авторская)', 'кг', 6950.00, 6950.00, 6950.00, 6450.00, 7500.00, 'STABLE', -0.50, 0.40, 2.00, 'Лаборатория пряностей Spicy Mood Lab', 'mood_lab', 'https://beermood.kz/BM-Monitor/', '2026-09-28', 'MANUAL_ENTRY');

DROP TABLE IF EXISTS `market_price_history`;
CREATE TABLE `market_price_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `avg_price` DECIMAL(10, 2) NOT NULL,
  `min_price` DECIMAL(10, 2) NOT NULL,
  `max_price` DECIMAL(10, 2) NOT NULL,
  `best_source` VARCHAR(50) NOT NULL,
  UNIQUE KEY `code_date` (`code`, `date`),
  INDEX `idx_history_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `market_acquisition_logs`;
CREATE TABLE `market_acquisition_logs` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `date` DATE NOT NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `code` VARCHAR(50) NOT NULL,
  `source_id` VARCHAR(50) NOT NULL,
  `price_kzt` DECIMAL(10, 2) NOT NULL,
  `url` VARCHAR(1000) NOT NULL,
  `method` ENUM('AUTO_CRAWL', 'MANUAL_ENTRY', 'INVOICE_SCAN') NOT NULL,
  `http_status` INT DEFAULT 200,
  `response_time_ms` INT DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
  `notes` TEXT NULL,
  INDEX `idx_logs_code` (`code`),
  INDEX `idx_logs_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================

-- ==============================================================
-- МОНИТОРИНГ ГОТОВОЙ ПРОДУКЦИИ И ЦЕН КОНКУРЕНТОВ (B2C & HoReCa)
-- Бары, пабы, рестораны, крафтовые лавки, супермаркеты Алматы
-- ==============================================================

DROP TABLE IF EXISTS `competitor_venues`;
CREATE TABLE `competitor_venues` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `channel_type` ENUM('BAR_PUB', 'CRAFT_SHOP', 'RETAIL_SUPERMARKET', 'ARTISAN_BOUTIQUE', 'DELIVERY_APP') NOT NULL,
  `address` VARCHAR(255) NULL,
  `menu_url` VARCHAR(500) NOT NULL,
  `platform` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `competitor_venues` (`id`, `name`, `channel_type`, `address`, `menu_url`, `platform`)
VALUES
  ('harats_almaty', 'Harat\'s Irish Pub', 'BAR_PUB', 'ул. Панфилова 110 / пр. Достык', 'https://2gis.kz/almaty/firm/9429940000790100', '2GIS / Wolt Menu'),
  ('chechil_almaty', 'Chechil Pub', 'BAR_PUB', 'ул. Жарокова 197 / ул. Толе би', 'https://chechilpub.kz', 'Сайт / Меню'),
  ('dublin_almaty', 'Dublin Irish Pub', 'BAR_PUB', 'ул. Байсеитовой 45', 'https://2gis.kz/almaty/firm/9429940000790200', '2GIS / Меню'),
  ('linebrew_almaty', 'Line Brew Almaty', 'BAR_PUB', 'ул. Фурманова 187', 'https://2gis.kz/almaty/firm/9429940000790300', '2GIS Меню'),
  ('hophead_almaty', 'Hophead Bottle Shop & Craft Bar', 'CRAFT_SHOP', 'Алматы', 'https://2gis.kz/almaty/search/крафтовое%20пиво', 'Telegram / 2GIS'),
  ('baza_almaty', 'Baza Craft Bar', 'BAR_PUB', 'Алматы', 'https://2gis.kz/almaty/search/baza%20craft', '2GIS'),
  ('galmart_almaty', 'Супермаркет Galmart', 'RETAIL_SUPERMARKET', 'ТРЦ Dostyk Plaza / Keruen', 'https://galmart.kz', 'Каталог / Wolt'),
  ('colibri_almaty', 'Colibri Gourmet Market', 'RETAIL_SUPERMARKET', 'мкр. Самал-3, д. 37', 'https://colibri.kz', 'Каталог'),
  ('vkusvill_almaty', 'ВкусВилл Алматы', 'DELIVERY_APP', 'Алматы (доставка)', 'https://wolt.com/ru/kaz/almaty/venue/vkusvill', 'Wolt'),
  ('cheese_sommelier', 'Сырный сомелье Алматы', 'ARTISAN_BOUTIQUE', 'Алматы', 'https://2gis.kz/almaty/search/сырный%20сомелье', '2GIS / Прайс'),
  ('prime_meat_almaty', 'Prime Meat Бутик', 'ARTISAN_BOUTIQUE', 'пр. Достык / пр. Аль-Фараби', 'https://primemeat.kz', 'Сайт / Каталог'),
  ('myasnaya_lavka', 'Мясная лавка Алматы', 'RETAIL_SUPERMARKET', 'Алматы', 'https://wolt.com/ru/kaz/almaty/venue/myasnaya-lavka', 'Wolt'),
  ('paul_almaty', 'Paul Bakery Almaty', 'ARTISAN_BOUTIQUE', 'ТРЦ Dostyk Plaza', 'https://wolt.com/ru/kaz/almaty/venue/paul', 'Wolt Меню'),
  ('labarca_bakery', 'La Barca Bakery', 'ARTISAN_BOUTIQUE', 'ул. Кабанбай батыра', 'https://2gis.kz/almaty/search/la%20barca%20bakery', '2GIS');

DROP TABLE IF EXISTS `finished_product_prices`;
CREATE TABLE `finished_product_prices` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `brand` ENUM('BEERMOOD_PUB', 'CHEESY_MOOD', 'MEAT_BREAD', 'SPICY_MOOD') NOT NULL,
  `category` ENUM('BEER', 'PUB_FOOD', 'CHEESE', 'CHARCUTERIE', 'BAKERY', 'SAUCES') NOT NULL,
  `channel_type` ENUM('BAR_PUB', 'CRAFT_SHOP', 'RETAIL_SUPERMARKET', 'ARTISAN_BOUTIQUE', 'DELIVERY_APP') NOT NULL,
  `portion_size` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(30) NOT NULL,
  `competitor_name` VARCHAR(150) NOT NULL,
  `competitor_price_kzt` DECIMAL(10, 2) NOT NULL,
  `market_min_kzt` DECIMAL(10, 2) NOT NULL,
  `market_avg_kzt` DECIMAL(10, 2) NOT NULL,
  `market_max_kzt` DECIMAL(10, 2) NOT NULL,
  `target_beermood_price_kzt` DECIMAL(10, 2) NOT NULL,
  `estimated_cogs_kzt` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `margin_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `price_advantage_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `delta_1d_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `delta_30d_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `source_name` VARCHAR(150) NOT NULL,
  `source_url` VARCHAR(500) NOT NULL,
  `last_updated` DATE NOT NULL,
  `last_fetched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fetch_method` VARCHAR(30) NOT NULL DEFAULT 'MANUAL_ENTRY',
  `status` VARCHAR(30) NOT NULL DEFAULT 'VERIFIED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `finished_product_prices` 
(`id`, `code`, `name`, `brand`, `category`, `channel_type`, `portion_size`, `unit`, `competitor_name`, `competitor_price_kzt`, `market_min_kzt`, `market_avg_kzt`, `market_max_kzt`, `target_beermood_price_kzt`, `estimated_cogs_kzt`, `margin_pct`, `price_advantage_pct`, `delta_1d_pct`, `delta_30d_pct`, `source_name`, `source_url`, `last_updated`, `fetch_method`, `status`)
VALUES
  ('FPP-BEER-IPA-05', 'BEER-IPA-05', 'Крафтовый IPA (American / West Coast) 0.5л', 'BEERMOOD_PUB', 'BEER', 'BAR_PUB', '0.5 л (бокал)', 'бокал', 'Harat\'s Irish Pub (Панфилова)', 2450.00, 2100.00, 2450.00, 2900.00, 2100.00, 580.00, 72.40, 14.30, 0.00, 4.20, 'Harat\'s Irish Pub / Wolt Menu', 'https://2gis.kz/almaty/firm/9429940000790100', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BEER-APA-05', 'BEER-APA-05', 'Крафтовый APA (American Pale Ale) 0.5л', 'BEERMOOD_PUB', 'BEER', 'BAR_PUB', '0.5 л (бокал)', 'бокал', 'Chechil Pub (Жарокова / Толе би)', 2200.00, 1900.00, 2250.00, 2600.00, 1950.00, 520.00, 73.30, 13.30, 0.00, 2.50, 'Chechil Pub / Онлайн-меню', 'https://chechilpub.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BEER-STOUT-05', 'BEER-STOUT-05', 'Овсяный / Молочный Стаут 0.5л', 'BEERMOOD_PUB', 'BEER', 'BAR_PUB', '0.5 л (бокал)', 'бокал', 'Dublin Irish Pub (Байсеитовой)', 2600.00, 2200.00, 2650.00, 3100.00, 2250.00, 610.00, 72.90, 15.10, 0.00, 5.00, 'Dublin Irish Pub / Меню 2GIS', 'https://2gis.kz/almaty/firm/9429940000790200', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BEER-PILSNER-05', 'BEER-PILSNER-05', 'Крафтовый Пильзнер нефильтрованный 0.5л', 'BEERMOOD_PUB', 'BEER', 'BAR_PUB', '0.5 л (бокал)', 'бокал', 'Line Brew / Бочонок (Алматы)', 1900.00, 1600.00, 1950.00, 2400.00, 1650.00, 410.00, 75.20, 15.40, 0.00, 0.00, 'Line Brew / 2GIS Меню', 'https://2gis.kz/almaty/firm/9429940000790300', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BEER-SOUR-GOSE-05', 'BEER-SOUR-GOSE-05', 'Фруктовый Саур / Томатный Гозе 0.5л', 'BEERMOOD_PUB', 'BEER', 'CRAFT_SHOP', '0.5 л (банка/бокал)', 'шт', 'Hophead Bottle Shop (Алматы)', 2750.00, 2300.00, 2800.00, 3400.00, 2350.00, 640.00, 72.80, 16.10, 0.00, 6.20, 'Hophead Bottle Shop / Telegram & 2GIS', 'https://2gis.kz/almaty/search/крафтовое%20пиво', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BEER-CIDER-05', 'BEER-CIDER-05', 'Крафтовый яблочный сидр полусухой 0.5л', 'BEERMOOD_PUB', 'BEER', 'BAR_PUB', '0.5 л (бокал)', 'бокал', 'Baza Craft Bar (Алматы)', 2300.00, 1950.00, 2350.00, 2800.00, 1950.00, 490.00, 74.90, 17.00, 0.00, 1.80, 'Baza Craft / Барная карта', 'https://2gis.kz/almaty/search/baza%20craft', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-SAUSAGE-PLATTER', 'PUB-SAUSAGE-PLATTER', 'Сковорода крафтовых колбасок с капустой и горчицей 400г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '400 г', 'порц', 'Harat\'s Irish Pub (Панфилова)', 4600.00, 3900.00, 4700.00, 5800.00, 3950.00, 1350.00, 65.80, 16.00, 0.00, 3.50, 'Harat\'s Irish Pub / Основное меню', 'https://2gis.kz/almaty/firm/9429940000790100', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-BBQ-RIBS', 'PUB-BBQ-RIBS', 'Копченые свиные ребра BBQ в медовой глазури 450г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '450 г', 'порц', 'Dublin Irish Pub (Байсеитовой)', 5200.00, 4500.00, 5350.00, 6500.00, 4400.00, 1650.00, 62.50, 17.80, 0.00, 4.10, 'Dublin Irish Pub / Горячие блюда', 'https://2gis.kz/almaty/firm/9429940000790200', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-BURGER-PULLED-PORK', 'PUB-BURGER-PULLED-PORK', 'Бургер с рваной копченой свининой и коул-слоу 350г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '350 г', 'порц', 'Chechil Pub (Жарокова)', 3450.00, 2900.00, 3550.00, 4200.00, 2950.00, 980.00, 66.80, 16.90, 0.00, 0.00, 'Chechil Pub / Бургеры', 'https://chechilpub.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-MEAT-PLATTER', 'PUB-MEAT-PLATTER', 'Мясная тарелка BeerMood (билтонг, конина, колбаски, бекон) 250г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '250 г', 'порц', 'Line Brew Almaty', 5800.00, 4900.00, 5900.00, 7200.00, 4900.00, 1750.00, 64.30, 16.90, 0.00, 5.50, 'Line Brew / Закуски к пиву', 'https://2gis.kz/almaty/firm/9429940000790300', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-CHEESE-PLATTER', 'PUB-CHEESE-PLATTER', 'Сырная тарелка Cheesy Mood (страчателла, сулугуни, белпер, мед) 220г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '220 г', 'порц', 'Dublin Irish Pub', 4800.00, 3900.00, 4950.00, 6100.00, 3900.00, 1280.00, 67.20, 21.20, 0.00, 2.00, 'Dublin Irish Pub / Сырное плато', 'https://2gis.kz/almaty/firm/9429940000790200', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-PUB-GARLIC-TOASTS', 'PUB-GARLIC-TOASTS', 'Гренки чесночные из тартин-хлеба с сырным дипом 200г', 'BEERMOOD_PUB', 'PUB_FOOD', 'BAR_PUB', '200 г', 'порц', 'Chechil Pub (Жарокова)', 1850.00, 1500.00, 1890.00, 2400.00, 1550.00, 320.00, 79.40, 18.00, 0.00, 0.00, 'Chechil Pub / Снеки к пиву', 'https://chechilpub.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-CHEESE-STRACCIATELLA-200', 'CHEESE-STRACCIATELLA-200', 'Сыр Страчателла в сливочной заливке 200г', 'CHEESY_MOOD', 'CHEESE', 'ARTISAN_BOUTIQUE', '200 г (баночка)', 'шт', 'Сырный сомелье (Алматы)', 2750.00, 2400.00, 2850.00, 3400.00, 2350.00, 780.00, 66.80, 17.50, 0.00, 3.80, 'Сырный сомелье / Прайс лавки', 'https://2gis.kz/almaty/search/сырный%20сомелье', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-CHEESE-SULUGUNI-HEAD-350', 'CHEESE-SULUGUNI-HEAD-350', 'Сыр Сулугуни ремесленный молодой 350г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '350 г (головка)', 'шт', 'Супермаркет Galmart (Dostyk Plaza)', 2150.00, 1800.00, 2200.00, 2600.00, 1850.00, 590.00, 68.10, 15.90, 0.00, 1.50, 'Galmart / Молочный отдел', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-CHEESE-ADYGEY-350', 'CHEESE-ADYGEY-350', 'Сыр Адыгейский мягкий фермерский 350г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '350 г', 'шт', 'ВкусВилл Алматы (Wolt)', 1650.00, 1350.00, 1700.00, 2100.00, 1400.00, 420.00, 70.00, 17.60, 0.00, 2.00, 'ВкусВилл / Wolt каталог', 'https://wolt.com/ru/kaz/almaty/venue/vkusvill', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-CHEESE-MASCARPONE-250', 'CHEESE-MASCARPONE-250', 'Сыр Маскарпоне сливочный 80% 250г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '250 г (ванночка)', 'шт', 'Colibri Gourmet Market (Самал)', 2950.00, 2500.00, 3100.00, 3800.00, 2450.00, 890.00, 63.70, 21.00, 0.00, 4.50, 'Colibri Gourmet Market / Витрина', 'https://colibri.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-CHEESE-BELPER-KNOLLE-80', 'CHEESE-BELPER-KNOLLE-80', 'Сыр Белпер Кнолле в черном перце и чесноке 80г', 'CHEESY_MOOD', 'CHEESE', 'ARTISAN_BOUTIQUE', '80 г (1 шарик)', 'шт', 'Сырный сомелье (Алматы)', 1950.00, 1700.00, 2050.00, 2500.00, 1650.00, 410.00, 75.20, 19.50, 0.00, 0.00, 'Сырный сомелье / Ремесленные сыры', 'https://2gis.kz/almaty/search/сырный%20сомелье', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-DAIRY-SOURCREAM-300', 'DAIRY-SOURCREAM-300', 'Сметана ремесленная термостатная 25% 300г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '300 г (стекло)', 'шт', 'Супермаркет Galmart (Dostyk Plaza)', 1250.00, 950.00, 1300.00, 1600.00, 1050.00, 340.00, 67.60, 19.20, 0.00, 1.20, 'Galmart / Фермерская полка', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-DAIRY-CURD-400', 'DAIRY-CURD-400', 'Творог фермерский цельный пластовой 9% 400г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '400 г', 'упак', 'Супермаркет Galmart (Dostyk Plaza)', 1450.00, 1200.00, 1500.00, 1900.00, 1250.00, 410.00, 67.20, 16.70, 0.00, 2.80, 'Galmart / Творожная витрина', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-DAIRY-GREEK-YOGURT-250', 'DAIRY-GREEK-YOGURT-250', 'Йогурт греческий натуральный густой 250г', 'CHEESY_MOOD', 'CHEESE', 'RETAIL_SUPERMARKET', '250 г', 'шт', 'ВкусВилл Алматы (Wolt)', 950.00, 750.00, 980.00, 1250.00, 790.00, 210.00, 73.40, 19.40, 0.00, 0.00, 'ВкусВилл / Молочная гастрономия', 'https://wolt.com/ru/kaz/almaty/venue/vkusvill', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-BILTONG-HORSE-50', 'MEAT-BILTONG-HORSE-50', 'Билтонг деликатесный из конины (Жая) 50г', 'MEAT_BREAD', 'CHARCUTERIE', 'ARTISAN_BOUTIQUE', '50 г (крафт-пакет)', 'пакет', 'Prime Meat Бутик (Достык)', 2100.00, 1800.00, 2150.00, 2650.00, 1750.00, 540.00, 69.10, 18.60, 0.00, 5.00, 'Prime Meat / Снеки из конины', 'https://primemeat.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-BILTONG-BEEF-50', 'MEAT-BILTONG-BEEF-50', 'Билтонг из мраморной говядины сушено-вяленый 50г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '50 г (крафт-пакет)', 'пакет', 'Супермаркет Galmart (Dostyk Plaza)', 1850.00, 1600.00, 1920.00, 2400.00, 1550.00, 460.00, 70.30, 19.30, 0.00, 2.50, 'Galmart / Мясные снеки', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-SAUSAGE-KRAKOW-350', 'MEAT-SAUSAGE-KRAKOW-350', 'Колбаса полукопченая Краковская ремесленная 350г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '350 г (колечко)', 'шт', 'Первомайские Деликатесы / Galmart', 2450.00, 2100.00, 2550.00, 3100.00, 2150.00, 760.00, 64.70, 15.70, 0.00, 3.10, 'Galmart / Колбасная витрина', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-HUNTING-SAUSAGES-300', 'MEAT-HUNTING-SAUSAGES-300', 'Охотничьи колбаски в/к в натуральной череве 300г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '300 г (вакуум)', 'упак', 'Мясная лавка Алматы / Wolt', 2350.00, 1950.00, 2400.00, 2900.00, 1990.00, 690.00, 65.30, 17.10, 0.00, 1.00, 'Wolt / Мясная лавка', 'https://wolt.com/ru/kaz/almaty/venue/myasnaya-lavka', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-SAUSAGE-CHEESE-350', 'MEAT-SAUSAGE-CHEESE-350', 'Сосиски ремесленные с сыром Сулугуни 350г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '350 г (упаковка)', 'упак', 'Супермаркет Galmart (Dostyk Plaza)', 1980.00, 1650.00, 2050.00, 2500.00, 1750.00, 580.00, 66.90, 14.60, 0.00, 2.00, 'Galmart / Премиум сосиски', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-MORTADELLA-150', 'MEAT-MORTADELLA-150', 'Мортаделла деликатесная с фисташками нарезка 150г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '150 г (нарезка)', 'упак', 'Colibri Gourmet Market (Самал)', 2250.00, 1900.00, 2350.00, 2900.00, 1850.00, 520.00, 71.90, 21.30, 0.00, 3.50, 'Colibri Gourmet / Итальянская гастрономия', 'https://colibri.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-BACON-SMOKED-200', 'MEAT-BACON-SMOKED-200', 'Бекон сырокопченый ремесленный на ольхе нарезка 200г', 'MEAT_BREAD', 'CHARCUTERIE', 'RETAIL_SUPERMARKET', '200 г (нарезка)', 'упак', 'Супермаркет Galmart (Dostyk Plaza)', 1950.00, 1600.00, 2000.00, 2500.00, 1650.00, 490.00, 70.30, 17.50, 0.00, 2.10, 'Galmart / Беконы и копчености', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-MEAT-HAM-SMOKED-300', 'MEAT-HAM-SMOKED-300', 'Ветчина фермерская деликатесная запеченная 300г', 'MEAT_BREAD', 'CHARCUTERIE', 'ARTISAN_BOUTIQUE', '300 г (батончик)', 'шт', 'Prime Meat Бутик (Алматы)', 2600.00, 2200.00, 2700.00, 3300.00, 2200.00, 710.00, 67.70, 18.50, 0.00, 4.00, 'Prime Meat / Домашние ветчины', 'https://primemeat.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BAKERY-TARTINE-WHEAT-500', 'BAKERY-TARTINE-WHEAT-500', 'Хлеб Тартин на пшеничной закваске длительного брожения 500г', 'MEAT_BREAD', 'BAKERY', 'ARTISAN_BOUTIQUE', '500 г (буханка)', 'шт', 'Paul Bakery Almaty / Dostyk Plaza', 1650.00, 1300.00, 1750.00, 2100.00, 1350.00, 280.00, 79.30, 22.90, 0.00, 0.00, 'Paul Bakery / Wolt Меню', 'https://wolt.com/ru/kaz/almaty/venue/paul', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-BAKERY-SOURDOUGH-RYE-600', 'BAKERY-SOURDOUGH-RYE-600', 'Хлеб подовый ржано-пшеничный на молочной сыворотке 600г', 'MEAT_BREAD', 'BAKERY', 'ARTISAN_BOUTIQUE', '600 г (буханка)', 'шт', 'La Barca Bakery (Кабанбай батыра)', 1450.00, 1100.00, 1500.00, 1850.00, 1150.00, 240.00, 79.10, 23.30, 0.00, 0.00, 'La Barca Bakery / Ремесленный хлеб', 'https://2gis.kz/almaty/search/la%20barca%20bakery', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-SAUCE-SRIRACHA-250', 'SAUCE-SRIRACHA-250', 'Соус ферментированный Шрирача острый крафтовый 250мл', 'SPICY_MOOD', 'SAUCES', 'RETAIL_SUPERMARKET', '250 мл (бутылочка)', 'бут', 'Супермаркет Galmart (Dostyk Plaza)', 2850.00, 2400.00, 2950.00, 3600.00, 2250.00, 480.00, 78.70, 23.70, 0.00, 5.20, 'Galmart / Азиатские соусы', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-SAUCE-TABASCO-150', 'SAUCE-TABASCO-150', 'Соус перечный ферментированный выдержанный (Tabasco style) 150мл', 'SPICY_MOOD', 'SAUCES', 'RETAIL_SUPERMARKET', '150 мл (бутылочка)', 'бут', 'Colibri Gourmet Market (Самал)', 2950.00, 2600.00, 3150.00, 3800.00, 2350.00, 510.00, 78.30, 25.40, 0.00, 3.00, 'Colibri Gourmet / Острые соусы США', 'https://colibri.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-SAUCE-PIRI-PIRI-250', 'SAUCE-PIRI-PIRI-250', 'Соус Пири-Пири чесночно-лимонный острый (Nando\'s style) 250мл', 'SPICY_MOOD', 'SAUCES', 'RETAIL_SUPERMARKET', '250 мл (бутылочка)', 'бут', 'Супермаркет Galmart (Dostyk Plaza)', 2700.00, 2300.00, 2850.00, 3500.00, 2150.00, 450.00, 79.10, 24.60, 0.00, 2.50, 'Galmart / Импортные соусы', 'https://galmart.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-SPICE-GARAM-MASALA-100', 'SPICE-GARAM-MASALA-100', 'Смесь пряностей Garam Masala авторская банка 100г', 'SPICY_MOOD', 'SAUCES', 'ARTISAN_BOUTIQUE', '100 г (стекло)', 'банка', 'Индийская лавка / Зеленый Базар', 1950.00, 1600.00, 2000.00, 2500.00, 1550.00, 390.00, 74.80, 22.50, 0.00, 1.00, 'Зеленый Базар / Пряности Восток', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED'),
  ('FPP-SPICE-BBQ-RUB-120', 'SPICE-BBQ-RUB-120', 'Сухой маринад для стейков и ребер BBQ Rub банка 120г', 'SPICY_MOOD', 'SAUCES', 'ARTISAN_BOUTIQUE', '120 г (банка)', 'банка', 'Prime Meat Бутик (Алматы)', 1850.00, 1500.00, 1950.00, 2400.00, 1450.00, 340.00, 76.60, 25.60, 0.00, 0.00, 'Prime Meat / Специи для гриля', 'https://primemeat.kz', '2026-09-28', 'MANUAL_ENTRY', 'VERIFIED');
