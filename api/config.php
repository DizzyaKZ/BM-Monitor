<?php
/**
 * Конфигурация подключения к MySQL на хостинге PS.kz (Plesk)
 * Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY / MEAT / BAKE / SPICY)
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'beermood_monitor');
define('DB_USER', 'beermood_monuser');
define('DB_PASS', 'AKc3LrWDrX6yt4E');
define('DB_CHARSET', 'utf8mb4');

// Целевой адрес Master ERP для синхронизации котировок
define('ERP_TARGET_API', 'https://beermood.kz/api/market-prices');
define('API_SECRET_KEY', 'bm_secret_monitor_almaty_key_2026');
