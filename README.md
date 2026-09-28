# MOOD Raw Material Price Monitor (BM-Monitor)
**Специализированное Angular-приложение с бэкендом на PHP/MySQL для хостинга PS.kz**  
*Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY MOOD / MEAT MOOD / BAKE MOOD / SPICY MOOD LAB)*  
*Локация проекта: `/Users/pavelspitsyn/Documents/BM-Monitor`*  
*Производственный объект: Казахстан, г. Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3)*

---

### Архитектура системы
1. **Frontend:** Angular 18 (Standalone-компоненты, Signals Reactive State, Fira Code / Plus Jakarta Sans, темная палитра `#0c0b0a`, `#181614`, `#e57c23`, `#27ae60`).
2. **Backend:** PHP 8+ REST API (`api/index.php`) на базе PDO с prepared statements, CORS заголовками и UTF-8mb4.
3. **Database:** MySQL 8.x / MariaDB (`database/schema.sql`) на сервере PS.kz.
4. **Интеграция с Master ERP:** Передача цен по REST API в таблицу `raw_material_prices` с сохранением первоисточников (URLs) и журналов аудита (логов).

---

### Быстрый старт в Visual Studio Code (macOS)
```bash
# 1. Перейдите в папку проекта:
cd /Users/pavelspitsyn/Documents/BM-Monitor

# 2. Установите зависимости:
npm install

# 3. Запустите сервер разработки Angular:
npm start
# Приложение откроется по адресу: http://localhost:4300/
```

---

### Развертывание на хостинге PS.kz (cPanel / Apache)
1. **Создание базы данных:**
   - В cPanel PS.kz создайте базу данных (например, `beermood_monitor`) и пользователя с полными правами.
   - Откройте **phpMyAdmin** и выполните импорт файла `database/schema.sql` (создадутся таблицы `raw_material_prices`, `market_sources`, `market_acquisition_logs` с начальными данными).
2. **Настройка подключения:**
   - Откройте `api/config.php` и укажите имя базы данных, пользователя и пароль от MySQL PS.kz.
3. **Сборка и выгрузка:**
   ```bash
   npm run build
   node scripts/package-pskz.js
   ```
   - Загрузите содержимое созданной папки `dist/bm-monitor/browser` (или сформированной `dist-pskz/`) в корневую папку сайта (`public_html`) на PS.kz.
   - Файл `.htaccess` автоматически обеспечит маршрутизацию Angular HTML5 и направит `/api/*` к PHP контроллеру.
