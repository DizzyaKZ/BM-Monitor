import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { FinishedProductBrand, ChannelType, FinishedProductItem } from '../models/market-monitor.model';

@Component({
  selector: 'app-finished-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card table-card">
      <div class="table-header">
        <div class="filter-group">
          <!-- Brand Filter Tabs -->
          <div class="brand-pills">
            <button 
              *ngFor="let b of brands"
              class="pill-btn"
              [class.active]="svc.selectedBrand() === b.id"
              (click)="svc.setSelectedBrand(b.id)">
              {{ b.label }}
            </button>
          </div>

          <!-- Channel Filter -->
          <div class="channel-select-wrap">
            <select 
              [ngModel]="svc.selectedChannel()"
              (ngModelChange)="svc.setSelectedChannel($event)"
              class="channel-select">
              <option value="ALL">Все каналы сбыта (Бары, Лавки, Ритейл)</option>
              <option value="BAR_PUB">🍺 Бары, пабы и рестораны</option>
              <option value="CRAFT_SHOP">🏪 Крафтовые боттлшопы и лавки</option>
              <option value="RETAIL_SUPERMARKET">🛒 Премиум-ритейл (Galmart, Colibri, ВкусВилл)</option>
              <option value="ARTISAN_BOUTIQUE">🧀 Сыроварни, мясные бутики и пекарни</option>
              <option value="DELIVERY_APP">🛵 Онлайн-каталоги и доставка (Wolt)</option>
            </select>
          </div>
        </div>

        <div class="actions-group">
          <div class="search-wrap">
            <input 
              type="text"
              placeholder="Поиск по продукту, коду или заведению..."
              [ngModel]="svc.finishedSearchQuery()"
              (ngModelChange)="svc.setFinishedSearch($event)"
              class="search-input" />
          </div>

          <button 
            class="btn btn-outline"
            (click)="svc.openFinishedEntryModal()"
            title="Добавить или скорректировать котировку позиции меню">
            ➕ Добавить позицию
          </button>

          <button 
            class="btn btn-outline"
            (click)="svc.exportFinishedCsv()"
            title="Экспорт мониторинга цен меню в Excel/CSV">
            📥 Экспорт CSV
          </button>

          <button 
            class="btn btn-outline"
            (click)="svc.exportFinishedSql()"
            title="Экспорт SQL дампа таблицы finished_product_prices">
            💾 SQL
          </button>
        </div>
      </div>

      <!-- Main Finished Products Table -->
      <div class="table-responsive">
        <table class="market-table">
          <thead>
            <tr>
              <th style="width: 70px;">КОД</th>
              <th>ГОТОВАЯ ПРОДУКЦИЯ & ФАСОВКА</th>
              <th>ЛИНЕЙКА</th>
              <th>ЗАВЕДЕНИЕ / КОНКУРЕНТ & МЕНЮ</th>
              <th class="text-right">ЦЕНА В МЕНЮ</th>
              <th class="text-center">РЫНОК (MIN - AVG - MAX)</th>
              <th class="text-right">ЦЕНА BEERMOOD</th>
              <th class="text-right">СЕБЕСТОИМОСТЬ</th>
              <th class="text-center">МАРЖА</th>
              <th class="text-center">ВЫГОДА ГОСТЯ</th>
              <th class="text-center">ДИНАМИКА 30Д</th>
              <th class="text-center">ВЕРИФИКАЦИЯ</th>
              <th class="text-center" style="width: 60px;">ДЕЙСТВИЯ</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of svc.filteredFinishedProducts()" class="table-row">
              <td class="cell-code">
                <code>{{ item.code }}</code>
              </td>

              <td class="cell-product">
                <div class="product-title">{{ item.name }}</div>
                <div class="product-portion">
                  <span class="badge-portion">{{ item.portion_size }}</span>
                  <span class="category-tag">{{ getCategoryLabel(item.category) }}</span>
                </div>
              </td>

              <td class="cell-brand">
                <span [class]="getBrandBadgeClass(item.brand)">
                  {{ getBrandLabel(item.brand) }}
                </span>
              </td>

              <td class="cell-competitor">
                <div class="competitor-name">
                  <strong>{{ item.competitor_name }}</strong>
                </div>
                <div class="competitor-source">
                  <a [href]="item.source_url" target="_blank" rel="noopener noreferrer" class="source-link" title="Открыть меню / источник в сети">
                    🔗 {{ item.source_name }}
                  </a>
                </div>
              </td>

              <td class="cell-price text-right font-mono">
                <div class="current-price text-ruby">
                  {{ item.competitor_price_kzt | number:'1.0-0' }} ₸
                </div>
                <div class="channel-hint">{{ getChannelLabel(item.channel_type) }}</div>
              </td>

              <td class="cell-market text-center font-mono">
                <div class="market-range">
                  <span class="min-p">{{ item.market_min_kzt | number:'1.0-0' }}</span>
                  <span class="sep">–</span>
                  <span class="avg-p">{{ item.market_avg_kzt | number:'1.0-0' }}</span>
                  <span class="sep">–</span>
                  <span class="max-p">{{ item.market_max_kzt | number:'1.0-0' }}</span>
                </div>
                <div class="avg-hint">среднее: {{ item.market_avg_kzt | number:'1.0-0' }} ₸</div>
              </td>

              <td class="cell-target text-right font-mono">
                <div class="target-price text-gold">
                  <strong>{{ item.target_beermood_price_kzt | number:'1.0-0' }} ₸</strong>
                </div>
                <div class="target-sub">Рекомендованная RRP</div>
              </td>

              <td class="cell-cogs text-right font-mono">
                <div class="cogs-price text-emerald">
                  {{ item.estimated_cogs_kzt | number:'1.0-0' }} ₸
                </div>
                <div class="cogs-sub">по ценам сырья</div>
              </td>

              <td class="cell-margin text-center">
                <span class="margin-badge" [class.badge-high]="(item.margin_pct || 0) >= 70">
                  {{ item.margin_pct }}%
                </span>
              </td>

              <td class="cell-advantage text-center">
                <span class="advantage-badge" [class.positive]="(item.price_advantage_pct || 0) > 0">
                  {{ (item.price_advantage_pct || 0) > 0 ? '+' : '' }}{{ item.price_advantage_pct }}%
                </span>
              </td>

              <td class="cell-delta text-center font-mono">
                <span [class]="getDeltaClass(item.delta_30d_pct)">
                  {{ (item.delta_30d_pct || 0) > 0 ? '+' : '' }}{{ item.delta_30d_pct || 0 }}%
                </span>
              </td>

              <td class="cell-date text-center font-mono">
                <div class="date-text">{{ item.last_updated }}</div>
                <span class="status-badge" [class.badge-verified]="item.status === 'VERIFIED'">
                  {{ item.status }}
                </span>
              </td>

              <td class="cell-actions text-center">
                <button 
                  class="btn-edit-icon" 
                  (click)="svc.openFinishedEntryModal(item)"
                  title="Быстро обновить цену или ссылку на меню">
                  ✏️
                </button>
              </td>
            </tr>

            <tr *ngIf="svc.filteredFinishedProducts().length === 0">
              <td colspan="13" class="empty-state">
                По вашему фильтру позиций готовой продукции не найдено.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .table-card {
      padding: 0;
      overflow: hidden;
      margin-bottom: 30px;
    }
    .table-header {
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .brand-pills {
      display: flex;
      gap: 4px;
      background: var(--bg-primary);
      padding: 3px;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
    }
    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.76rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn.active {
      background: var(--accent-amber);
      color: #fff;
    }
    .channel-select {
      background: var(--bg-primary);
      color: #fff;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 0.8rem;
      outline: none;
    }
    .actions-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .search-input {
      background: var(--bg-primary);
      color: #fff;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 0.8rem;
      width: 260px;
      outline: none;
    }
    .search-input:focus {
      border-color: var(--accent-amber);
    }
    .table-responsive {
      overflow-x: auto;
    }
    .market-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }
    .market-table th {
      background: rgba(255, 255, 255, 0.02);
      color: var(--text-secondary);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      white-space: nowrap;
    }
    .market-table td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    .table-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .cell-code code {
      font-family: monospace;
      font-size: 0.72rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.04);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .cell-product .product-title {
      font-weight: 700;
      color: #fff;
      margin-bottom: 3px;
    }
    .product-portion {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-portion {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      font-size: 0.68rem;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    .category-tag {
      font-size: 0.68rem;
      color: var(--text-secondary);
    }
    .badge-brand-pub {
      background: rgba(230, 126, 34, 0.15);
      color: #f39c12;
      border: 1px solid rgba(230, 126, 34, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-brand-cheese {
      background: rgba(241, 196, 15, 0.15);
      color: #f1c40f;
      border: 1px solid rgba(241, 196, 15, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-brand-meat {
      background: rgba(231, 76, 60, 0.15);
      color: #e74c3c;
      border: 1px solid rgba(231, 76, 60, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .badge-brand-spicy {
      background: rgba(155, 89, 182, 0.15);
      color: #9b59b6;
      border: 1px solid rgba(155, 89, 182, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
    }
    .competitor-name strong {
      color: #fff;
      font-size: 0.8rem;
    }
    .source-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.72rem;
      transition: text-decoration 0.2s;
    }
    .source-link:hover {
      text-decoration: underline;
    }
    .current-price {
      font-size: 0.96rem;
      font-weight: 800;
    }
    .channel-hint {
      font-size: 0.68rem;
      color: var(--text-secondary);
    }
    .market-range {
      font-size: 0.76rem;
      color: #cbd5e1;
    }
    .market-range .sep { color: #64748b; margin: 0 2px; }
    .avg-hint {
      font-size: 0.68rem;
      color: var(--text-secondary);
    }
    .target-price {
      font-size: 0.98rem;
      font-weight: 800;
    }
    .target-sub, .cogs-sub {
      font-size: 0.68rem;
      color: var(--text-secondary);
    }
    .cogs-price {
      font-size: 0.9rem;
      font-weight: 700;
    }
    .margin-badge {
      background: rgba(39, 174, 96, 0.15);
      color: #2ecc71;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.74rem;
      font-weight: 700;
      font-family: monospace;
    }
    .margin-badge.badge-high {
      background: rgba(39, 174, 96, 0.25);
      border: 1px solid rgba(39, 174, 96, 0.4);
    }
    .advantage-badge {
      background: rgba(241, 196, 15, 0.15);
      color: #f1c40f;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.74rem;
      font-weight: 700;
      font-family: monospace;
    }
    .advantage-badge.positive {
      color: #f1c40f;
    }
    .delta-up { color: #f87171; }
    .delta-down { color: #34d399; }
    .delta-stable { color: #94a3b8; }
    .status-badge {
      font-size: 0.66rem;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }
    .status-badge.badge-verified {
      background: rgba(52, 152, 219, 0.15);
      color: var(--accent-cyan);
    }
    .date-text {
      font-size: 0.72rem;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }
    .btn-edit-icon {
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      cursor: pointer;
      padding: 4px 6px;
      font-size: 0.8rem;
      transition: background 0.2s;
    }
    .btn-edit-icon:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .empty-state {
      text-align: center;
      padding: 30px;
      color: var(--text-secondary);
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .text-ruby { color: #f87171 !important; }
    .text-gold { color: #f1c40f !important; }
    .text-emerald { color: #2ecc71 !important; }
  `]
})
export class FinishedTableComponent {
  svc = inject(MarketMonitorService);

  brands = [
    { id: 'ALL' as FinishedProductBrand, label: 'Все (35)' },
    { id: 'BEERMOOD_PUB' as FinishedProductBrand, label: '🍺 BEERMOOD.PUB' },
    { id: 'CHEESY_MOOD' as FinishedProductBrand, label: '🧀 CHEESY MOOD' },
    { id: 'MEAT_BREAD' as FinishedProductBrand, label: '🥩 MEAT & BREAD' },
    { id: 'SPICY_MOOD' as FinishedProductBrand, label: '🌶️ SPICY MOOD LAB' }
  ];

  getBrandLabel(brand: FinishedProductBrand): string {
    switch (brand) {
      case 'BEERMOOD_PUB': return '🍺 BEERMOOD';
      case 'CHEESY_MOOD': return '🧀 CHEESY';
      case 'MEAT_BREAD': return '🥩 MEAT&BREAD';
      case 'SPICY_MOOD': return '🌶️ SPICY LAB';
      default: return brand;
    }
  }

  getBrandBadgeClass(brand: FinishedProductBrand): string {
    switch (brand) {
      case 'BEERMOOD_PUB': return 'badge-brand-pub';
      case 'CHEESY_MOOD': return 'badge-brand-cheese';
      case 'MEAT_BREAD': return 'badge-brand-meat';
      case 'SPICY_MOOD': return 'badge-brand-spicy';
      default: return 'badge-brand-pub';
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'BEER': return 'Крафтовое пиво';
      case 'PUB_FOOD': return 'Кухня паба';
      case 'CHEESE': return 'Ремесленный сыр';
      case 'CHARCUTERIE': return 'Деликатесы и колбасы';
      case 'BAKERY': return 'Заквасочный хлеб';
      case 'SAUCES': return 'Крафтовые соусы';
      default: return category;
    }
  }

  getChannelLabel(channel: ChannelType): string {
    switch (channel) {
      case 'BAR_PUB': return 'Бар / Паб';
      case 'CRAFT_SHOP': return 'Крафтовый боттлшоп';
      case 'RETAIL_SUPERMARKET': return 'Супермаркет';
      case 'ARTISAN_BOUTIQUE': return 'Ремесленная лавка';
      case 'DELIVERY_APP': return 'Доставка (Wolt)';
      default: return 'Розница';
    }
  }

  getDeltaClass(val?: number): string {
    if (!val) return 'delta-stable';
    return val > 0 ? 'delta-up' : 'delta-down';
  }
}
