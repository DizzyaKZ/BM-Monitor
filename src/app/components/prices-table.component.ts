import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { RawMaterialItem } from '../models/market-monitor.model';

@Component({
  selector: 'app-prices-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Category Tabs -->
    <div class="nav-tabs">
      <button class="tab-btn" [class.active]="svc.selectedCategory() === 'ALL'" (click)="svc.selectedCategory.set('ALL')">
        🌟 Все группы ({{ svc.rawMaterials().length }})
      </button>
      <button class="tab-btn" [class.active]="svc.selectedCategory() === 'MILK'" (click)="svc.selectedCategory.set('MILK')">
        🥛 Молочное производство (CHEESY)
      </button>
      <button class="tab-btn" [class.active]="svc.selectedCategory() === 'MEAT'" (click)="svc.selectedCategory.set('MEAT')">
        🥩 Мясное производство (MEAT)
      </button>
      <button class="tab-btn" [class.active]="svc.selectedCategory() === 'FLOUR'" (click)="svc.selectedCategory.set('FLOUR')">
        🍞 Хлебное производство (BAKE)
      </button>
      <button class="tab-btn" [class.active]="svc.selectedCategory() === 'SPICE'" (click)="svc.selectedCategory.set('SPICE')">
        🌶️ Специи & Пряности (SPICY LAB)
      </button>
    </div>

    <!-- Table Section -->
    <section class="table-panel">
      <div class="table-top">
        <div>
          <h3>📋 Сводная таблица рыночных цен и первоисточников (г. Алматы)</h3>
          <p>Кликните по ссылке для перехода на страницу предложения или нажмите «Лог» для просмотра аудита.</p>
        </div>
        <div class="table-actions">
          <div class="method-pills">
            <button 
              class="pill-btn" 
              [class.active]="svc.rawMethodFilter() === 'ALL'" 
              (click)="svc.rawMethodFilter.set('ALL')">
              Все ({{ svc.rawMaterials().length }})
            </button>
            <button 
              class="pill-btn pill-auto" 
              [class.active]="svc.rawMethodFilter() === 'AUTO_CRAWL'" 
              (click)="svc.rawMethodFilter.set('AUTO_CRAWL')"
              title="Позиции с автоматическим онлайн-парсингом (METRO, Arbuz, Magnum, Kaspi, Satu, Bifi)">
              🤖 Авто-сбор ({{ getAutoCount() }})
            </button>
            <button 
              class="pill-btn pill-manual" 
              [class.active]="svc.rawMethodFilter() === 'MANUAL_ENTRY'" 
              (click)="svc.rawMethodFilter.set('MANUAL_ENTRY')"
              title="Позиции с ручным сбором данных (Алтын Орда, Зеленый Базар, Оптовка) — исключены из динамики">
              📝 Ручной ввод ({{ getManualCount() }})
            </button>
          </div>

          <input
            type="text"
            class="search-input"
            placeholder="Поиск по названию или коду сырья..."
            [ngModel]="svc.searchQuery()"
            (ngModelChange)="svc.searchQuery.set($event)"
          >
          <a class="btn btn-outline" href="/api/export-csv" download="market_prices_almaty.csv">📥 Скачать CSV</a>
          <a class="btn btn-outline" href="/api/export-sql" download="raw_material_prices_sync.sql">💾 SQL Дамп</a>
        </div>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Код</th>
              <th>Категория</th>
              <th>Наименование сырья</th>
              <th>Ед.</th>
              <th style="text-align:right;">Мин. в Алматы</th>
              <th style="text-align:right;">Средняя цена</th>
              <th style="text-align:right;">Макс. цена</th>
              <th style="text-align:center;">24ч %</th>
              <th style="text-align:center;">Тренд 7д</th>
              <th style="text-align:center;">Дата парсинга</th>
              <th>Выгодный источник</th>
              <th>Ссылка на источник</th>
              <th style="text-align:center;">Аудит</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of svc.filteredMaterials()">
              <td><span class="badge font-mono">{{ item.code }}</span></td>
              <td>
                <span class="badge" [ngClass]="getCategoryBadge(item.category)">
                  {{ item.category }}
                </span>
              </td>
              <td><strong>{{ item.name }}</strong></td>
              <td class="font-mono text-muted">{{ item.unit }}</td>
              <td class="font-mono" style="text-align:right; color:var(--accent-emerald); font-weight:700;">
                {{ svc.formatMoney(item.market_min_kzt) }}
              </td>
              <td class="font-mono" style="text-align:right; font-weight:600;">
                {{ svc.formatMoney(item.market_avg_kzt) }}
              </td>
              <td class="font-mono" style="text-align:right; color:var(--accent-ruby);">
                {{ svc.formatMoney(item.market_max_kzt) }}
              </td>
              <td class="font-mono" style="text-align:center;" [ngClass]="getDeltaClass(item.delta_1d_pct)">
                {{ item.delta_1d_pct > 0 ? '▲ +' : (item.delta_1d_pct < 0 ? '▼ ' : '') }}{{ item.delta_1d_pct }}%
              </td>
              <td style="text-align:center;">
                <span *ngIf="item.trend === 'UP'" class="badge badge-ruby">▲ РОСТ {{ item.trend_pct }}%</span>
                <span *ngIf="item.trend === 'DOWN'" class="badge badge-emerald">▼ СПАД {{ item.trend_pct }}%</span>
                <span *ngIf="item.trend === 'STABLE'" class="badge badge-cyan">─ СТАБИЛЬНО</span>
              </td>
              <td style="text-align:center; font-size:0.75rem; white-space:nowrap;">
                <div class="font-mono" style="color:var(--text-primary); font-weight:600;">
                  {{ formatFetchDate(item.last_fetched_at || item.last_updated) }}
                </div>
                <div style="font-size:0.68rem; margin-top:2px;">
                  <span class="badge" [class.badge-emerald]="item.fetch_method === 'AUTO_CRAWL'" [class.badge-cyan]="item.fetch_method === 'MANUAL_ENTRY'">
                    {{ item.fetch_method === 'AUTO_CRAWL' ? '🤖 АВТО' : '✍️ РУЧНОЙ' }}
                  </span>
                </div>
              </td>
              <td>
                <span style="font-size:0.75rem; color:var(--accent-gold);">★ {{ item.supplier }}</span>
              </td>
              <td>
                <a [href]="item.source_url" target="_blank" rel="noopener noreferrer" class="source-link" title="Открыть первоисточник котировки">
                  🔗 Открыть источник ↗
                </a>
              </td>
              <td style="text-align:center; white-space:nowrap;">
                <button class="btn btn-outline" style="padding:4px 8px; font-size:0.74rem;" (click)="onViewChart(item.code)" title="Показать график">
                  📊
                </button>
                <button class="btn btn-cyan" style="padding:4px 8px; font-size:0.74rem;" (click)="svc.openLogsModal(item.code)" title="Посмотреть лог получения">
                  📜 Лог
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="svc.filteredMaterials().length === 0" class="empty-state-box">
          <div style="font-size:2.2rem; margin-bottom:8px;">📭</div>
          <h4 style="font-size:1.1rem; color:#fff; margin-bottom:6px;">Сводная таблица пуста (0 позиций)</h4>
          <p style="font-size:0.8rem; color:var(--text-secondary); max-width:550px; margin:0 auto 16px auto;">
            База данных полностью очищена. Вы можете загрузить 43 проверенные позиции сырья MOOD GROUP с актуальными котировками или ввести новые данные вручную.
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn-emerald" (click)="onInitClean()">
              ⚡ Загрузить проверенную базу (43 позиции)
            </button>
            <button class="btn btn-primary" (click)="svc.openFastEntryModal()">
              ➕ Быстрый ввод котировки
            </button>
          </div>
        </div>

      </div>

      <!-- ERP Card -->
      <div class="erp-sync-box">
        <div class="erp-info">
          <h4>🔗 Прямая интеграция с BEERMOOD Master ERP (PS.kz / MySQL)</h4>
          <p>Синхронизация обновляет таблицу <code>raw_material_prices</code>, мгновенно пересчитывая себестоимость рецептур в технологических картах.</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" [(ngModel)]="erpTargetUrl" style="width:280px; font-size:0.78rem;">
          <button class="btn btn-emerald" [disabled]="svc.isSyncing()" (click)="onSync()">
            ⚡ Отправить котировки в ERP
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .nav-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .tab-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 9px 18px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.84rem;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .tab-btn:hover { color: #fff; border-color: var(--border-strong); }
    .tab-btn.active {
      background: var(--accent-amber-glow);
      color: var(--accent-amber);
      border-color: var(--accent-amber);
    }
    .table-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 40px;
    }
    .table-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 16px;
    }
    .table-top h3 { font-size: 1.1rem; color: #fff; }
    .table-top p { font-size: 0.75rem; color: var(--text-secondary); }
    .table-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .search-input { width: 340px; max-width: 100%; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.83rem; text-align: left; }
    th {
      background: var(--bg-surface);
      color: var(--text-muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-strong);
      font-weight: 700;
    }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); }
    tr:hover td { background: var(--bg-surface-elevated); }
    .source-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.76rem;
      padding: 2px 6px;
      background: var(--accent-cyan-soft);
      border-radius: 4px;
    }
    .source-link:hover { color: #fff; background: var(--accent-cyan); }
        .empty-state-box {
      text-align: center;
      padding: 40px 20px;
      background: var(--bg-surface);
      border: 1px dashed var(--border-strong);
      border-radius: 8px;
      margin: 16px 0;
    }
    .erp-sync-box {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 16px;
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .erp-info h4 { font-size: 0.9rem; color: #fff; margin-bottom: 2px; }
    .erp-info p { font-size: 0.75rem; color: var(--text-secondary); }
    .trend-up { color: var(--accent-ruby); font-weight: 700; }
    .trend-down { color: var(--accent-emerald); font-weight: 700; }
    .trend-stable { color: var(--text-muted); }
  
    .method-pills {
      display: flex;
      gap: 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 3px;
    }
    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.74rem;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn.active {
      background: var(--accent-amber);
      color: #fff;
    }
    .pill-auto.active {
      background: var(--accent-emerald) !important;
    }
    .pill-manual.active {
      background: #64748b !important;
    }
    .row-manual {
      background: rgba(255, 255, 255, 0.012) !important;
      opacity: 0.72;
    }
    .row-manual:hover {
      opacity: 0.95;
    }
    .row-manual td {
      color: #94a3b8 !important;
    }
    .manual-label {
      font-size: 0.62rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.4px;
      margin-top: 2px;
    }
    .sub-manual-note {
      font-size: 0.68rem;
      color: #64748b;
      margin-top: 2px;
    }
    .badge-method-auto {
      background: rgba(39, 174, 96, 0.15);
      color: #2ecc71;
      border: 1px solid rgba(39, 174, 96, 0.3);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .badge-method-manual {
      background: rgba(148, 163, 184, 0.12);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.25);
      font-size: 0.62rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .manual-dash {
      color: #64748b;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .mt-1 { margin-top: 4px; }
`]
})
export class PricesTableComponent {
  svc = inject(MarketMonitorService);
  erpTargetUrl = 'http://localhost:4200/api/market-prices';

  getCategoryBadge(cat: string) {
    if (cat === 'MILK') return 'badge-cyan';
    if (cat === 'MEAT') return 'badge-ruby';
    if (cat === 'FLOUR') return 'badge-gold';
    return 'badge-emerald';
  }

  getDeltaClass(d: number) {
    if (d > 0) return 'trend-up';
    if (d < 0) return 'trend-down';
    return 'trend-stable';
  }

  onViewChart(code: string) {
    this.svc.loadHistory(code, this.svc.selectedDays());
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  async onSync() {
    this.svc.erpApiUrl.set(this.erpTargetUrl);
    await this.svc.syncWithErp();
  }

  formatFetchDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}.${month}.${d.getFullYear()} ${hours}:${mins}`;
    } catch (e) {
      return dateStr;
    }
  }

  async onInitClean() {
    await this.svc.resetDatabase();
  }

  getAutoCount(): number {
    return this.svc.rawMaterials().filter(i => i.fetch_method === 'AUTO_CRAWL').length;
  }

  getManualCount(): number {
    return this.svc.rawMaterials().filter(i => i.fetch_method === 'MANUAL_ENTRY').length;
  }
}
