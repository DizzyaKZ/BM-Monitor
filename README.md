# MOOD Raw Material Price Monitor (BM-Monitor v1.2)
**Автономный сервис ежедневного мониторинга цен сырья с фиксацией ссылок и журналом аудита**
*Холдинг MOOD GROUP (BEERMOOD.PUB / CHEESY MOOD / MEAT MOOD / BAKE MOOD / SPICY MOOD LAB)*  
*Локация проекта: `/Users/pavelspitsyn/Documents/BM-Monitor`*  
*Производственный объект: Казахстан, г. Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3)*

---

## 1. Возможности системы
1. **Первоисточники и ссылки на витрины:**
   - Каждая зафиксированная котировка снабжена прямой ссылкой на страницу товара или карточку поставщика (Kaspi, Arbuz, METRO, Magnum, Satu, Алтын Орда, Зеленый Базар).
2. **Журнал аудита получения цен (Acquisition Logs):**
   - Точные метки времени (ISO timestamp с точностью до секунды).
   - Метод фиксации (`AUTO_CRAWL` для онлайн-площадок, `MANUAL_ENTRY` для утренних звонков и накладных).
   - HTTP-статусы ответов серверов и задержка отклика (ms).
3. **Графики и волатильность:**
   - Динамика средневзвешенной цены в Алматы за 7, 14 и 30 дней.
   - Коридор колебаний цен Min/Max.
4. **Интеграция с Master ERP:**
   - Прямой перенос в один клик по REST API (`/api/market-prices`).
   - Экспорт в SQL-дамп и CSV с сохранением ссылок на источники.

---

## 2. Быстрый запуск в Visual Studio Code (macOS)
```bash
code /Users/pavelspitsyn/Documents/BM-Monitor
cd /Users/pavelspitsyn/Documents/BM-Monitor
node --watch server.js
```
Веб-интерфейс: **http://localhost:4300**
