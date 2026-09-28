<?php
/**
 * Конфигурация подключения к MySQL на хостинге PS.kz
 * Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY / MEAT / BAKE / SPICY)
 */

// Параметры базы данных на сервере PS.kz (cPanel MySQL)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'beermood_monitor');
define('DB_USER', getenv('DB_USER') ?: 'beermood_user');
define('DB_PASS', getenv('DB_PASS') ?: 'MoodGroup2026!');
define('DB_CHARSET', 'utf8mb4');

// Целевой адрес Master ERP для синхронизации котировок
define('ERP_TARGET_API', getenv('ERP_TARGET_API') ?: 'https://beermood.kz/api/market-prices');

// Секретный ключ API (опционально)
define('API_SECRET_KEY', 'bm_secret_monitor_almaty_key_2026');
