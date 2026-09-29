import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';
import { FinishedProductBrand, FinishedProductItem } from '../models/market-monitor.model';

@Component({
  selector: 'app-finished-benchmark-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card benchmark-card">
      <div class="card-header">
        <div class="header-titles">
          <h2>📊 Сравнительный бенчмарк: Себестоимость сырья vs Меню конкурентов vs BeerMood</h2>
          <p>Анализ структуры цены: себестоимость сырья (COGS) • рекомендованная цена BeerMood • среднее по рынку Алматы • максимум в премиум-сегменте</p>
        </div>
        <div class="chart-actions">
          <div class="brand-tabs">
            <button 
              *ngFor="let b of brands"
              class="tab-btn"
              [class.active]="selectedChartBrand() === b.id"
              (click)="selectedChartBrand.set(b.id)">
              {{ b.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="benchmark-body">
        <div class="items-list">
          <div *ngFor="let item of displayItems()" class="benchmark-row">
            <div class="row-info">
              <div class="row-title">
                <span class="product-name">{{ item.name }}</span>
                <span class="portion-badge">{{ item.portion_size }}</span>
              </div>
              <div class="row-meta">
                <span class="competitor-tag">📍 {{ item.competitor_name }}</span>
                <span class="margin-tag">Маржа: <strong>{{ item.margin_pct }}%</strong></span>
                <span class="advantage-tag" [class.positive]="(item.price_advantage_pct || 0) > 0">
                  Выгода гостя: <strong>{{ (item.price_advantage_pct || 0) > 0 ? '+' : '' }}{{ item.price_advantage_pct }}%</strong>
                </span>
              </div>
            </div>

            <div class="bars-container">
              <div class="price-track">
                <!-- COGS point/bar -->
                <div 
                  class="bar-segment cogs-segment" 
                  [style.width.%]="getBarWidth(item.estimated_cogs_kzt, item.market_max_kzt)"
                  title="Себестоимость сырья: {{ item.estimated_cogs_kzt }} ₸">
                  <span class="bar-label">{{ item.estimated_cogs_kzt }} ₸</span>
                </div>

                <!-- BeerMood Target Marker -->
                <div 
                  class="marker beermood-marker"
                  [style.left.%]="getBarWidth(item.target_beermood_price_kzt, item.market_max_kzt)"
                  title="Целевая цена BeerMood: {{ item.target_beermood_price_kzt }} ₸">
                  <div class="marker-pin pin-beermood"></div>
                  <span class="marker-text">{{ item.target_beermood_price_kzt }} ₸</span>
                </div>

                <!-- Competitor Current Marker -->
                <div 
                  class="marker competitor-marker"
                  [style.left.%]="getBarWidth(item.competitor_price_kzt, item.market_max_kzt)"
                  title="Цена конкурента: {{ item.competitor_price_kzt }} ₸">
                  <div class="marker-pin pin-competitor"></div>
                  <span class="marker-text text-ruby">{{ item.competitor_price_kzt }} ₸</span>
                </div>

                <!-- Market Average Marker -->
                <div 
                  class="marker avg-marker"
                  [style.left.%]="getBarWidth(item.market_avg_kzt, item.market_max_kzt)"
                  title="Среднее по рынку: {{ item.market_avg_kzt }} ₸">
                  <div class="marker-pin pin-avg"></div>
                  <span class="marker-text text-muted">{{ item.market_avg_kzt }} ₸</span>
                </div>
              </div>

              <div class="track-bounds">
                <span>Мин: {{ item.market_min_kzt }} ₸</span>
                <span>Рыночный макс: {{ item.market_max_kzt }} ₸</span>
              </div>
            </div>
          </div>
        </div>

        <div class="legend-panel">
          <div class="legend-item"><span class="legend-color color-cogs"></span> <strong>Себестоимость сырья (COGS)</strong></div>
          <div class="legend-item"><span class="legend-color color-beermood"></span> <strong>Целевая цена BeerMood (RRP)</strong></div>
          <div class="legend-item"><span class="legend-color color-competitor"></span> <strong>Текущая цена в меню конкурента</strong></div>
          <div class="legend-item"><span class="legend-color color-avg"></span> <strong>Средняя розничная цена по Алматы</strong></div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .benchmark-card {
      margin-bottom: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }
    .header-titles h2 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .header-titles p {
      font-size: 0.76rem;
      color: var(--text-secondary);
    }
    .brand-tabs {
      display: flex;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 3px;
      gap: 3px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 6px 12px;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: var(--accent-amber);
      color: #fff;
    }
    .benchmark-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .benchmark-row {
      background: var(--bg-surface);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 320px 1fr;
      align-items: center;
      gap: 20px;
    }
    @media (max-width: 900px) {
      .benchmark-row {
        grid-template-columns: 1fr;
      }
    }
    .row-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .row-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .product-name {
      font-weight: 700;
      font-size: 0.88rem;
      color: #fff;
    }
    .portion-badge {
      background: rgba(255, 255, 255, 0.08);
      color: var(--text-secondary);
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
    .row-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.74rem;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }
    .competitor-tag {
      color: var(--accent-cyan);
    }
    .margin-tag strong {
      color: var(--accent-emerald);
    }
    .advantage-tag.positive strong {
      color: var(--accent-gold);
    }
    .bars-container {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .price-track {
      position: relative;
      background: rgba(255, 255, 255, 0.04);
      height: 28px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: visible;
    }
    .cogs-segment {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      background: rgba(39, 174, 96, 0.35);
      border-right: 2px solid var(--accent-emerald);
      border-radius: 3px 0 0 3px;
      display: flex;
      align-items: center;
      padding-left: 6px;
    }
    .cogs-segment .bar-label {
      font-size: 0.68rem;
      font-family: monospace;
      font-weight: 700;
      color: #a7f3d0;
      white-space: nowrap;
    }
    .marker {
      position: absolute;
      top: -2px;
      bottom: -2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      transform: translateX(-50%);
    }
    .marker-pin {
      width: 3px;
      height: 100%;
      border-radius: 2px;
    }
    .pin-beermood {
      background: var(--accent-amber);
      box-shadow: 0 0 6px rgba(230, 126, 34, 0.8);
    }
    .pin-competitor {
      background: var(--accent-ruby);
      box-shadow: 0 0 6px rgba(231, 76, 60, 0.8);
    }
    .pin-avg {
      background: #94a3b8;
    }
    .marker-text {
      position: absolute;
      bottom: -18px;
      font-size: 0.68rem;
      font-family: monospace;
      font-weight: 700;
      white-space: nowrap;
      color: #fff;
    }
    .text-ruby { color: #f87171 !important; }
    .text-muted { color: #94a3b8 !important; }

    .track-bounds {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--text-secondary);
      font-family: monospace;
      margin-top: 14px;
    }
    .legend-panel {
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 10px 16px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.74rem;
      color: var(--text-secondary);
    }
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
    .color-cogs { background: rgba(39, 174, 96, 0.6); border: 1px solid var(--accent-emerald); }
    .color-beermood { background: var(--accent-amber); }
    .color-competitor { background: var(--accent-ruby); }
    .color-avg { background: #94a3b8; }
  `]
})
export class FinishedBenchmarkChartComponent {
  svc = inject(MarketMonitorService);

  brands = [
    { id: 'ALL', label: 'Все позиции' },
    { id: 'BEERMOOD_PUB', label: '🍺 BEERMOOD.PUB' },
    { id: 'CHEESY_MOOD', label: '🧀 CHEESY MOOD' },
    { id: 'MEAT_BREAD', label: '🥩 MEAT & BREAD' },
    { id: 'SPICY_MOOD', label: '🌶️ SPICY MOOD LAB' }
  ];

  selectedChartBrand = signal<string>('ALL');

  displayItems = computed(() => {
    const brand = this.selectedChartBrand();
    const all = this.svc.finishedProducts();
    if (brand === 'ALL') {
      return all.slice(0, 8);
    }
    return all.filter(i => i.brand === brand).slice(0, 8);
  });

  getBarWidth(val: number, max: number): number {
    if (!max || max <= 0) return 0;
    const pct = (val / max) * 100;
    return Math.min(Math.max(pct, 2), 98);
  }
}
