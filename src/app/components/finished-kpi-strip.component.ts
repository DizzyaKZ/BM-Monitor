import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-finished-kpi-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">ОХВАТ МЕНЮ И ТОЧЕК</span>
          <span class="kpi-badge badge-cyan">Almaty Venues</span>
        </div>
        <div class="kpi-value">
          {{ kpi().total }} <span class="kpi-unit">позиций</span>
        </div>
        <div class="kpi-subtext">
          🤖 <strong>{{ kpi().autoCount }}</strong> онлайн-меню • 📝 <strong>{{ kpi().manualCount }}</strong> оффлайн (исключены из авто-динамики)
        </div>
      </div>

      <div class="kpi-card highlight-amber">
        <div class="kpi-header">
          <span class="kpi-title">ПЛАНОВАЯ МАРЖА BEERMOOD</span>
          <span class="kpi-badge badge-emerald">Gross Margin</span>
        </div>
        <div class="kpi-value text-emerald">
          {{ kpi().avgMarginPct }}<span class="kpi-unit">%</span>
        </div>
        <div class="kpi-subtext">
          Средняя валовая наценка целевой цены относительно себестоимости сырья
        </div>
      </div>

      <div class="kpi-card highlight-gold">
        <div class="kpi-header">
          <span class="kpi-title">ВЫГОДА ГОСТЯ К РЫНКУ</span>
          <span class="kpi-badge badge-gold">Price Handicap</span>
        </div>
        <div class="kpi-value text-gold">
          +{{ kpi().avgPriceAdvantagePct }}<span class="kpi-unit">%</span>
        </div>
        <div class="kpi-subtext">
          Разница между ценой BeerMood и средней ценой аналогов в заведениях Алматы
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">ТОП МАРЖИНАЛЬНАЯ ПОЗИЦИЯ</span>
          <span class="kpi-badge badge-ruby">High Yield</span>
        </div>
        <div class="kpi-value-small text-amber">
          {{ kpi().topMarginProduct }}
        </div>
        <div class="kpi-subtext">
          Флагман доходности среди ремесленных продуктов и барных напитков
        </div>
      </div>
    </section>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .kpi-card:hover {
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .kpi-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.8px;
    }
    .kpi-badge {
      font-size: 0.68rem;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }
    .badge-cyan { background: rgba(52, 152, 219, 0.15); color: var(--accent-cyan); }
    .badge-emerald { background: rgba(39, 174, 96, 0.15); color: var(--accent-emerald); }
    .badge-gold { background: rgba(241, 196, 15, 0.15); color: var(--accent-gold); }
    .badge-ruby { background: rgba(231, 76, 60, 0.15); color: var(--accent-ruby); }

    .kpi-value {
      font-size: 2.1rem;
      font-weight: 800;
      font-family: monospace;
      color: #fff;
      line-height: 1.1;
      margin-bottom: 8px;
    }
    .kpi-value-small {
      font-size: 1.05rem;
      font-weight: 700;
      font-family: monospace;
      line-height: 1.3;
      margin-bottom: 8px;
      word-break: break-word;
    }
    .kpi-unit {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .kpi-subtext {
      font-size: 0.76rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .kpi-subtext strong { color: #fff; }
    .text-emerald { color: #2ecc71 !important; }
    .text-gold { color: #f1c40f !important; }
    .text-amber { color: #e67e22 !important; }
  `]
})
export class FinishedKpiStripComponent {
  svc = inject(MarketMonitorService);
  kpi = this.svc.finishedKpiSummary;
}
