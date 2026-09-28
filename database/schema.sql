-- ==============================================================
-- BM-Monitor: База данных MySQL 8.x / MariaDB для хостинга PS.kz
-- Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY / MEAT / BAKE / SPICY)
-- Объект: Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3)
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `beermood_monitor` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `beermood_monitor`;

-- 1. Справочник каналов котировок в Алматы
DROP TABLE IF EXISTS `market_sources`;
CREATE TABLE `market_sources` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('MARKET', 'HYPERMARKET', 'ONLINE', 'SUPPLIER') NOT NULL,
  `base_url` VARCHAR(500) NOT NULL,
  `description` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `market_sources` (`id`, `name`, `type`, `base_url`, `description`) VALUES
('altyn_orda', 'Рынок «Алтын Орда» (Оптовый хаб)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000788647', 'Крупнооптовые мясные и бакалейные ряды'),
('zeleny_bazar', '«Зеленый Базар» (Мясной/Молочный ряд)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000788648', 'Павильон свежего мяса, конины и молока'),
('optovka', '«Оптовка» (Розыбакиева / Райымбека)', 'MARKET', 'https://2gis.kz/almaty/firm/9429940000792341', 'Базы фасованной муки, сахара, бакалеи и специй'),
('metro_almaty', 'METRO Cash & Carry Алматы (HoReCa B2B)', 'HYPERMARKET', 'https://online.metro-cc.kz/', 'B2B каталог и HoReCa прайс-листы'),
('magnum_almaty', 'Magnum Cash & Carry (Опт/Доставка)', 'HYPERMARKET', 'https://magnum.kz/catalog', 'Сетевой опт и розничные индикаторы'),
('arbuz_almaty', 'Arbuz.kz (Онлайн-маркет)', 'ONLINE', 'https://arbuz.kz/ru/almaty/', 'Фермерское молоко и охлажденное мясо'),
('kaspi_magaz', 'Kaspi Магазин / Kaspi Продукты', 'ONLINE', 'https://kaspi.kz/shop/c/food/', 'Маркетплейс, оптовые партии от поставщиков'),
('satu_almaty', 'Satu.kz B2B Поставщики Алматы', 'ONLINE', 'https://almaty.satu.kz/', 'Каталог заквасок, оболочек, специй и муки'),
('direct_suppliers', 'Прямые контракты / Склады Алматы', 'SUPPLIER', 'https://bifi.kz/shop/vendor/sacco-italiya', 'Официальные дистрибьюторы Sacco, Puratos, мясокомбинаты');

-- 2. Актуальные цены на сырье (Полная совместимость с Master ERP)
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
  `supplier` VARCHAR(255) NOT NULL,
  `source_url` VARCHAR(500) NOT NULL,
  `last_updated` DATE NOT NULL,
  `last_fetched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fetch_method` ENUM('AUTO_CRAWL', 'MANUAL_ENTRY', 'INVOICE_SCAN') DEFAULT 'AUTO_CRAWL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data for 43 items
INSERT INTO `raw_material_prices` (`id`, `code`, `category`, `name`, `unit`, `base_price_kzt`, `current_cost_kzt`, `market_avg_kzt`, `market_min_kzt`, `market_max_kzt`, `trend`, `trend_pct`, `delta_1d_pct`, `supplier`, `source_url`, `last_updated`, `fetch_method`)
VALUES
  ('RMP-MILK-RAW-COW', 'MILK-RAW-COW', 'MILK', 'Сырое коровье молоко (базис 3.8/3.2)', 'л', 297.18, 297.18, 297.18, 279.81, 322.32, 'UP', 3.65, 0.31, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-MILK-GOAT', 'MILK-GOAT', 'MILK', 'Сырое козье молоко фермерское', 'л', 848.23, 848.23, 848.23, 795.04, 910.29, 'UP', 1.86, 0.71, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CREAM-RAW-35', 'CREAM-RAW-35', 'MILK', 'Сливки сырые 35% (для маскарпоне)', 'кг', 2625.06, 2625.06, 2625.06, 2423.25, 2778.83, 'DOWN', -1.63, -0.79, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CULTURE-SACCO-MS062', 'CULTURE-SACCO-MS062', 'MILK', 'Закваска Sacco MS062 (100 UC)', 'упак', 14617.19, 14617.19, 14617.19, 13748.27, 16123.83, 'STABLE', 0.8, -0.9, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CULTURE-SACCO-MS064', 'CULTURE-SACCO-MS064', 'MILK', 'Закваска Sacco MS064 (творог/сыр 100 UC)', 'упак', 15448.66, 15448.66, 15448.66, 14574.47, 16659.48, 'UP', 4.36, -0.77, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-ENZYME-RENNET', 'ENZYME-RENNET', 'MILK', 'Сычужный фермент Microclerici (100 мл)', 'флак', 3539.1, 3539.1, 3539.1, 3306.98, 3754.47, 'DOWN', -3.4, -0.03, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CALCIUM-CHLORIDE', 'CALCIUM-CHLORIDE', 'MILK', 'Кальций хлористый пищевой E509 (фарм)', 'кг', 1261.25, 1261.25, 1261.25, 1157.91, 1422.56, 'STABLE', 0.43, -0.49, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SALT-CHEESE', 'SALT-CHEESE', 'MILK', 'Соль вакуумная мелкая Экстра (чистая)', 'кг', 195.69, 195.69, 195.69, 178.77, 215.34, 'UP', 3.81, 2.42, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TENDERLOIN', 'BEEF-TENDERLOIN', 'MEAT', 'Говядина вырезка охлажденная (Алматы)', 'кг', 5391.72, 5391.72, 5391.72, 4964.92, 6123.08, 'STABLE', 0.51, 0.8, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-ROUND-TOP', 'BEEF-ROUND-TOP', 'MEAT', 'Говядина тазобедренная мякоть (окорок)', 'кг', 3909.24, 3909.24, 3909.24, 3643.45, 4169.24, 'UP', 2.03, 0.59, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-SHOULDER', 'BEEF-SHOULDER', 'MEAT', 'Говядина лопатка б/к', 'кг', 3581.81, 3581.81, 3581.81, 3272.77, 4061.57, 'UP', 4.58, 1.78, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BEEF-TRIM-8020', 'BEEF-TRIM-8020', 'MEAT', 'Тримминг говяжий 80/20 (колбасный)', 'кг', 3327.92, 3327.92, 3327.92, 3146.85, 3769.12, 'UP', 5.38, 2.56, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-HALF', 'PORK-HALF', 'MEAT', 'Свинина в полутушах (1-я категория)', 'кг', 2060.47, 2060.47, 2060.47, 1927.46, 2319.17, 'DOWN', -2.6, -0.15, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-LEG', 'PORK-LEG', 'MEAT', 'Свинина окорок б/к охл.', 'кг', 2609.07, 2609.07, 2609.07, 2437.05, 2794.4, 'DOWN', -3.28, 2.3, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-BELLY', 'PORK-BELLY', 'MEAT', 'Свинина грудинка б/к (на бекон)', 'кг', 2802.92, 2802.92, 2802.92, 2658.06, 2997.62, 'STABLE', 1.46, 0.15, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-PORK-FATBACK', 'PORK-FATBACK', 'MEAT', 'Шпик свиной хребтовый твердый', 'кг', 2277.31, 2277.31, 2277.31, 2158.79, 2482.92, 'UP', 3.47, -2.1, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAYA', 'HORSE-ZHAYA', 'MEAT', 'Конина Жая охлажденная (высший сорт)', 'кг', 4465.28, 4465.28, 4465.28, 4123.0, 4801.42, 'STABLE', -0.82, -2.46, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-KAZY-RAW', 'HORSE-KAZY-RAW', 'MEAT', 'Конина реберная часть (на Казы)', 'кг', 5159.8, 5159.8, 5159.8, 4765.41, 5814.49, 'UP', 2.68, 1.86, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-HORSE-ZHAL', 'HORSE-ZHAL', 'MEAT', 'Конина Жал подгривный жир', 'кг', 3815.15, 3815.15, 3815.15, 3504.03, 4247.99, 'STABLE', 1.27, 0.59, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-PORK-3840', 'CASING-PORK-3840', 'MEAT', 'Черева свиная 38/40 мм (пучок 91.4м)', 'пучок', 9540.2, 9540.2, 9540.2, 8806.42, 10333.79, 'UP', 3.28, 1.13, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-CASING-SHEEP-2224', 'CASING-SHEEP-2224', 'MEAT', 'Черева баранья 22/24 мм (сосиски/пивчики)', 'пучок', 11315.42, 11315.42, 11315.42, 10465.92, 12059.88, 'DOWN', -1.9, -0.02, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-NITRITE-SALT-06', 'NITRITE-SALT-06', 'MEAT', 'Нитритная соль 0.6% Suprasel', 'кг', 443.45, 443.45, 443.45, 410.44, 474.14, 'UP', 2.18, 0.07, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-WOOD-CHIPS-ALDER', 'WOOD-CHIPS-ALDER', 'MEAT', 'Щепа ольховая 6-8 мм для Ижицы (15 кг)', 'мешок', 4211.14, 4211.14, 4211.14, 3910.43, 4665.17, 'DOWN', -2.37, 0.85, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-PREM', 'FLOUR-WHEAT-PREM', 'FLOUR', 'Мука пшеничная высший сорт (W 280-320)', 'кг', 314.31, 314.31, 314.31, 288.04, 348.24, 'STABLE', -0.53, -0.31, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHEAT-1ST', 'FLOUR-WHEAT-1ST', 'FLOUR', 'Мука пшеничная 1 сорт (хлебопекарная)', 'кг', 255.41, 255.41, 255.41, 238.85, 285.66, 'STABLE', 1.49, 2.32, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-WHOLEGRAIN', 'FLOUR-WHOLEGRAIN', 'FLOUR', 'Мука пшеничная цельнозерновая обойная', 'кг', 448.17, 448.17, 448.17, 420.97, 485.0, 'UP', 2.94, 0.6, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-RYE-PEELED', 'FLOUR-RYE-PEELED', 'FLOUR', 'Мука ржаная обдирная (на Тартин/Бородинский)', 'кг', 303.58, 303.58, 303.58, 279.57, 341.87, 'STABLE', 1.18, 2.97, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-FLOUR-SEMOLA-DURUM', 'FLOUR-SEMOLA-DURUM', 'FLOUR', 'Мука Семола дурум (твердая пшеница)', 'кг', 714.18, 714.18, 714.18, 667.88, 796.77, 'DOWN', -2.12, -0.61, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-YEAST-COMPRESSED', 'YEAST-COMPRESSED', 'FLOUR', 'Дрожжи прессованные хлебопекарные', 'кг', 763.25, 763.25, 763.25, 728.28, 821.61, 'STABLE', 0.89, 0.88, '«Оптовка» (Розыбакиева / Райымбека)', 'https://2gis.kz/almaty/firm/9429940000792341?query=Дрожжи+прессованные+хлебопекарные', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-MALT-RED-FERM', 'MALT-RED-FERM', 'FLOUR', 'Солод ржаной ферментированный красный', 'кг', 767.74, 767.74, 767.74, 712.32, 829.39, 'UP', 3.51, 1.07, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-BUTTER-825', 'BUTTER-825', 'FLOUR', 'Масло сливочное 82.5% ГОСТ (монолит)', 'кг', 3674.46, 3674.46, 3674.46, 3375.83, 3890.09, 'UP', 4.84, 2.26, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-SESAME', 'SEEDS-SESAME', 'FLOUR', 'Кунжут белый очищенный индийский', 'кг', 1923.41, 1923.41, 1923.41, 1789.45, 2178.01, 'STABLE', -0.28, 1.2, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SEEDS-PUMPKIN', 'SEEDS-PUMPKIN', 'FLOUR', 'Семена тыквы очищенные', 'кг', 2830.75, 2830.75, 2830.75, 2651.71, 3087.09, 'STABLE', 0.92, 1.21, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PEPPER-BLACK', 'SPICE-PEPPER-BLACK', 'SPICE', 'Перец черный горошек (Вьетнам 550 г/л)', 'кг', 4259.23, 4259.23, 4259.23, 3916.71, 4620.48, 'DOWN', -3.25, -0.86, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CORIANDER', 'SPICE-CORIANDER', 'SPICE', 'Кориандр семена отборные', 'кг', 1234.93, 1234.93, 1234.93, 1149.64, 1330.47, 'UP', 2.81, -0.08, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CUMIN-ZIRA', 'SPICE-CUMIN-ZIRA', 'SPICE', 'Зира (кумин) отборная иранская', 'кг', 4090.73, 4090.73, 4090.73, 3753.01, 4504.12, 'DOWN', -5.0, -1.02, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SMOKED', 'SPICE-PAPRIKA-SMOKED', 'SPICE', 'Паприка копченая Pimenton ASTA 120', 'кг', 3803.3, 3803.3, 3803.3, 3602.29, 4234.02, 'UP', 2.23, 1.47, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-PAPRIKA-SWEET', 'SPICE-PAPRIKA-SWEET', 'SPICE', 'Паприка сладкая молотая ASTA 140', 'кг', 2785.76, 2785.76, 2785.76, 2643.58, 2990.38, 'UP', 2.35, 1.27, '«Оптовка» (Розыбакиева / Райымбека)', 'https://2gis.kz/almaty/firm/9429940000792341?query=Паприка+сладкая+молотая+ASTA+140', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-GARLIC-GRAN', 'SPICE-GARLIC-GRAN', 'SPICE', 'Чеснок сушеный гранулированный 40-60', 'кг', 2233.98, 2233.98, 2233.98, 2060.94, 2443.94, 'DOWN', -2.7, -1.97, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CHILI-FLAKES', 'SPICE-CHILI-FLAKES', 'SPICE', 'Перец чили дробленый / кайенский острый', 'кг', 3262.28, 3262.28, 3262.28, 2978.55, 3631.54, 'UP', 4.67, 0.09, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-NUTMEG-GROUND', 'SPICE-NUTMEG-GROUND', 'SPICE', 'Мускатный орех молотый высший сорт', 'кг', 8434.93, 8434.93, 8434.93, 8002.63, 9036.64, 'UP', 5.16, 1.58, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-CARDAMOM', 'SPICE-CARDAMOM', 'SPICE', 'Кардамон зеленый цельный отборный', 'кг', 19070.2, 19070.2, 19070.2, 17700.15, 20761.38, 'STABLE', -1.31, 0.03, 'Рынок «Алтын Орда» (Оптовый хаб)', 'https://2gis.kz/almaty/firm/9429940000788647', '2026-09-28', 'MANUAL_ENTRY'),
  ('RMP-SPICE-GARAM-MASALA', 'SPICE-GARAM-MASALA', 'SPICE', 'Смесь Spicy Mood Garam Masala (авторская)', 'кг', 6956.45, 6956.45, 6956.45, 6442.01, 7529.6, 'STABLE', -0.48, 0.42, 'Прямые контракты / Склады Алматы', 'https://bifi.kz/shop/vendor/sacco-italiya', '2026-09-28', 'MANUAL_ENTRY');

-- 3. Временные ряды для графиков динамики
DROP TABLE IF EXISTS `market_price_history`;
CREATE TABLE `market_price_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATE NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `avg_price` DECIMAL(10, 2) NOT NULL,
  `min_price` DECIMAL(10, 2) NOT NULL,
  `max_price` DECIMAL(10, 2) NOT NULL,
  `best_source` VARCHAR(50) NOT NULL,
  INDEX `idx_code_date` (`code`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Журнал аудита получения цен (Acquisition Logs)
DROP TABLE IF EXISTS `market_acquisition_logs`;
CREATE TABLE `market_acquisition_logs` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `date` DATE NOT NULL,
  `timestamp` TIMESTAMP NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `source_id` VARCHAR(50) NOT NULL,
  `price_kzt` DECIMAL(10, 2) NOT NULL,
  `url` VARCHAR(500) NULL,
  `method` ENUM('AUTO_CRAWL', 'MANUAL_ENTRY', 'INVOICE_SCAN') NOT NULL,
  `http_status` INT NOT NULL DEFAULT 200,
  `response_time_ms` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(50) NOT NULL DEFAULT 'VERIFIED',
  `notes` TEXT NULL,
  INDEX `idx_log_code` (`code`),
  INDEX `idx_log_time` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
