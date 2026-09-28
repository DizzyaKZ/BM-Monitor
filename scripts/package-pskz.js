/**
 * Скрипт подготовки дистрибутива для загрузки на хостинг PS.kz
 * Холдинг MOOD GROUP (Алматы, ул. Жарокова 137/1)
 * Создает папку dist-pskz/ готовую к загрузке в public_html через cPanel File Manager или FTP
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const distPskz = path.join(rootDir, 'dist-pskz');

console.log('🚀 Сборка проекта для хостинга PS.kz (MySQL + PHP)...');

// 1. Очистка старой папки
if (fs.existsSync(distPskz)) {
  fs.rmSync(distPskz, { recursive: true, force: true });
}
fs.mkdirSync(distPskz, { recursive: true });

// 2. Копирование PHP API и .htaccess
const apiSource = path.join(rootDir, 'api');
const apiDest = path.join(distPskz, 'api');
fs.cpSync(apiSource, apiDest, { recursive: true });

const dbSource = path.join(rootDir, 'database');
const dbDest = path.join(distPskz, 'database');
fs.cpSync(dbSource, dbDest, { recursive: true });

fs.copyFileSync(path.join(rootDir, '.htaccess'), path.join(distPskz, '.htaccess'));

console.log('✅ PHP API, .htaccess и SQL-дамп подготовлены в:', distPskz);
console.log('👉 Для загрузки на PS.kz:');
console.log('   1. Создайте базу данных в cPanel PS.kz и импортируйте database/schema.sql в phpMyAdmin');
console.log('   2. Настройте доступы в api/config.php');
console.log('   3. Загрузите содержимое dist-pskz/ в корневую папку сайта (public_html)');
