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
  ('metro_almaty', 'METRO Cash & Carry Алматы (HoReCa B2B)', 'HYPERMARKET', 'https://online.metro-cc.kz/', 'Профессиональный B2B HoReCa каталог: мясо, мука, сливочное масло, специи'),
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
  ('RMP-SALT-CHEESE', 'SALT-CHEESE', 'MILK', 'Соль вакуумная мелкая Экстра (чистая)', 'кг', 195.00, 195.00, 195.00, 180.00, 220.00, 'UP', 1.50, 0.00, 3.20, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/sol-sahar/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TENDERLOIN', 'BEEF-TENDERLOIN', 'MEAT', 'Говядина вырезка охлажденная (Алматы)', 'кг', 5400.00, 5400.00, 5400.00, 5000.00, 6100.00, 'STABLE', 0.50, 0.20, 2.10, 'Рынок «Алтын Орда» (Мясной ангар)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-ROUND-TOP', 'BEEF-ROUND-TOP', 'MEAT', 'Говядина тазобедренная мякоть (окорок)', 'кг', 3900.00, 3900.00, 3900.00, 3650.00, 4200.00, 'UP', 2.00, 0.40, 4.50, '«Зеленый Базар» (Мясные ряды)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-SHOULDER', 'BEEF-SHOULDER', 'MEAT', 'Говядина лопатка б/к', 'кг', 3600.00, 3600.00, 3600.00, 3350.00, 3950.00, 'UP', 3.20, 0.80, 5.10, 'METRO Cash & Carry Алматы (Мясной B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/myaso-ptica/govyadina/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TRIM-8020', 'BEEF-TRIM-8020', 'MEAT', 'Тримминг говяжий 80/20 (колбасный)', 'кг', 3350.00, 3350.00, 3350.00, 3150.00, 3600.00, 'UP', 4.10, 1.20, 6.80, 'Satu.kz B2B Мясокомбинаты Алматы', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=говядина+тримминг+оптом', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-HALF', 'PORK-HALF', 'MEAT', 'Свинина в полутушах (1-я категория)', 'кг', 2050.00, 2050.00, 2050.00, 1920.00, 2250.00, 'DOWN', -2.20, -0.30, -3.50, 'Рынок «Алтын Орда» (Мясной ангар)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-LEG', 'PORK-LEG', 'MEAT', 'Свинина окорок б/к охл.', 'кг', 2600.00, 2600.00, 2600.00, 2400.00, 2800.00, 'DOWN', -1.80, 0.50, -2.10, 'METRO Cash & Carry Алматы (Мясной B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/myaso-ptica/svinina/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-BELLY', 'PORK-BELLY', 'MEAT', 'Свинина грудинка б/к (на бекон)', 'кг', 2800.00, 2800.00, 2800.00, 2650.00, 3050.00, 'STABLE', 1.10, 0.00, 2.30, '«Зеленый Базар» (Свиные ряды)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-FATBACK', 'PORK-FATBACK', 'MEAT', 'Шпик свиной хребтовый твердый', 'кг', 2250.00, 2250.00, 2250.00, 2100.00, 2450.00, 'UP', 2.80, -0.80, 4.10, 'Рынок «Алтын Орда» (Мясной опт)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAYA', 'HORSE-ZHAYA', 'MEAT', 'Конина Жая охлажденная (высший сорт)', 'кг', 4450.00, 4450.00, 4450.00, 4150.00, 4850.00, 'STABLE', -0.50, -0.50, 1.20, '«Зеленый Базар» (Павильон конины)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-KAZY-RAW', 'HORSE-KAZY-RAW', 'MEAT', 'Конина реберная часть (на Казы)', 'кг', 5150.00, 5150.00, 5150.00, 4800.00, 5700.00, 'UP', 2.40, 1.00, 3.80, 'Рынок «Алтын Орда» (Павильон конины)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAL', 'HORSE-ZHAL', 'MEAT', 'Конина Жал подгривный жир', 'кг', 3800.00, 3800.00, 3800.00, 3500.00, 4200.00, 'STABLE', 1.00, 0.20, 2.00, '«Зеленый Базар» (Павильон конины)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-PORK-3840', 'CASING-PORK-3840', 'MEAT', 'Черева свиная 38/40 мм (пучок 91.4м)', 'пучок', 9500.00, 9500.00, 9500.00, 8800.00, 10300.00, 'UP', 3.00, 0.80, 4.50, 'Satu.kz (Оболочки для колбас Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=черева+свиная', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-SHEEP-2224', 'CASING-SHEEP-2224', 'MEAT', 'Черева баранья 22/24 мм (сосиски/пивчики)', 'пучок', 11300.00, 11300.00, 11300.00, 10500.00, 12100.00, 'DOWN', -1.50, 0.00, -2.00, 'Satu.kz (Оболочки для колбас Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=черева+баранья', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-NITRITE-SALT-06', 'NITRITE-SALT-06', 'MEAT', 'Нитритная соль 0.6% Suprasel', 'кг', 440.00, 440.00, 440.00, 410.00, 480.00, 'UP', 2.00, 0.00, 3.00, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Нитритная+соль', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-WOOD-CHIPS-ALDER', 'WOOD-CHIPS-ALDER', 'MEAT', 'Щепа ольховая 6-8 мм для Ижицы (15 кг)', 'мешок', 4200.00, 4200.00, 4200.00, 3900.00, 4600.00, 'DOWN', -2.00, 0.50, -1.50, 'Satu.kz (Щепа для копчения Алматы)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=щепа+ольховая+для+копчения', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-PREM', 'FLOUR-WHEAT-PREM', 'FLOUR', 'Мука пшеничная высший сорт (W 280-320)', 'кг', 315.00, 315.00, 315.00, 290.00, 350.00, 'STABLE', -0.50, -0.20, 0.80, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/muka/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-1ST', 'FLOUR-WHEAT-1ST', 'FLOUR', 'Мука пшеничная 1 сорт (хлебопекарная)', 'кг', 255.00, 255.00, 255.00, 240.00, 280.00, 'STABLE', 1.20, 0.50, 2.00, 'Рынок «Алтын Орда» (Мучные оптовые склады)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHOLEGRAIN', 'FLOUR-WHOLEGRAIN', 'FLOUR', 'Мука пшеничная цельнозерновая обойная', 'кг', 445.00, 445.00, 445.00, 420.00, 480.00, 'UP', 2.50, 0.40, 3.80, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/muka/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-RYE-PEELED', 'FLOUR-RYE-PEELED', 'FLOUR', 'Мука ржаная обдирная (на Тартин/Бородинский)', 'кг', 305.00, 305.00, 305.00, 280.00, 340.00, 'STABLE', 1.00, 0.80, 2.10, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Мука+ржаная+обдирная', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-SEMOLA-DURUM', 'FLOUR-SEMOLA-DURUM', 'FLOUR', 'Мука Семола дурум (твердая пшеница)', 'кг', 715.00, 715.00, 715.00, 670.00, 790.00, 'DOWN', -2.00, -0.40, -1.50, 'METRO Cash & Carry Алматы (Импорт HoReCa)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/muka/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-YEAST-COMPRESSED', 'YEAST-COMPRESSED', 'FLOUR', 'Дрожжи прессованные хлебопекарные', 'кг', 760.00, 760.00, 760.00, 725.00, 820.00, 'STABLE', 0.80, 0.50, 1.40, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Дрожжи+прессованные+хлебопекарные', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-MALT-RED-FERM', 'MALT-RED-FERM', 'FLOUR', 'Солод ржаной ферментированный красный', 'кг', 765.00, 765.00, 765.00, 710.00, 830.00, 'UP', 3.10, 0.80, 4.50, 'Satu.kz (Ингредиенты для выпечки и пива)', 'satu_almaty', 'https://almaty.satu.kz/search?search_term=солод+ржаной+ферментированный', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BUTTER-825', 'BUTTER-825', 'FLOUR', 'Масло сливочное 82.5% ГОСТ (монолит)', 'кг', 3650.00, 3650.00, 3650.00, 3400.00, 3900.00, 'UP', 4.50, 1.50, 7.20, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/molochnye-produkty-syr-yayca/maslo-slivochnoe/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-SESAME', 'SEEDS-SESAME', 'FLOUR', 'Кунжут белый очищенный индийский', 'кг', 1920.00, 1920.00, 1920.00, 1780.00, 2150.00, 'STABLE', -0.30, 0.50, 1.00, '«Зеленый Базар» (Ряды орехов и семян)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-PUMPKIN', 'SEEDS-PUMPKIN', 'FLOUR', 'Семена тыквы очищенные', 'кг', 2830.00, 2830.00, 2830.00, 2650.00, 3050.00, 'STABLE', 0.80, 0.60, 2.20, '«Зеленый Базар» (Ряды орехов и семян)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PEPPER-BLACK', 'SPICE-PEPPER-BLACK', 'SPICE', 'Перец черный горошек (Вьетнам 550 г/л)', 'кг', 4250.00, 4250.00, 4250.00, 3950.00, 4600.00, 'DOWN', -3.00, -0.50, -2.50, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CORIANDER', 'SPICE-CORIANDER', 'SPICE', 'Кориандр семена отборные', 'кг', 1240.00, 1240.00, 1240.00, 1150.00, 1330.00, 'UP', 2.50, 0.00, 3.00, 'Рынок «Алтын Орда» (Оптовый хаб)', 'altyn_orda', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CUMIN-ZIRA', 'SPICE-CUMIN-ZIRA', 'SPICE', 'Зира (кумин) отборная иранская', 'кг', 4090.00, 4090.00, 4090.00, 3750.00, 4500.00, 'DOWN', -4.50, -0.80, -4.00, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SMOKED', 'SPICE-PAPRIKA-SMOKED', 'SPICE', 'Паприка копченая Pimenton ASTA 120', 'кг', 3800.00, 3800.00, 3800.00, 3600.00, 4200.00, 'UP', 2.00, 0.80, 3.50, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/specii-pripravy/', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SWEET', 'SPICE-PAPRIKA-SWEET', 'SPICE', 'Паприка сладкая молотая ASTA 140', 'кг', 2780.00, 2780.00, 2780.00, 2640.00, 2980.00, 'UP', 2.20, 0.90, 3.80, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Паприка+сладкая+молотая+ASTA+140', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-GARLIC-GRAN', 'SPICE-GARLIC-GRAN', 'SPICE', 'Чеснок сушеный гранулированный 40-60', 'кг', 2230.00, 2230.00, 2230.00, 2050.00, 2450.00, 'DOWN', -2.50, -1.20, -3.00, '«Оптовка» (Райымбека / Розыбакиева)', 'optovka', 'https://2gis.kz/almaty/firm/9429940000792341?query=Чеснок+сушеный+гранулированный', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CHILI-FLAKES', 'SPICE-CHILI-FLAKES', 'SPICE', 'Перец чили дробленый / кайенский острый', 'кг', 3260.00, 3260.00, 3260.00, 2980.00, 3600.00, 'UP', 4.20, 0.10, 5.00, '«Зеленый Базар» (Восточные ряды специй)', 'zeleny_bazar', 'https://2gis.kz/almaty/firm/9429940000788648', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-NUTMEG-GROUND', 'SPICE-NUTMEG-GROUND', 'SPICE', 'Мускатный орех молотый высший сорт', 'кг', 8450.00, 8450.00, 8450.00, 8000.00, 9000.00, 'UP', 5.00, 1.20, 8.00, 'METRO Cash & Carry Алматы (HoReCa B2B)', 'metro_almaty', 'https://online.metro-cc.kz/category/bakaleya/specii-pripravy/', '2026-09-28', 'MANUAL_ENTRY'),
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
