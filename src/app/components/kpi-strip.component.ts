import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-kpi-strip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-grid" *ngIf="svc.kpiSummary() as kpi">
      <div class="kpi-card gold">
        <span class="kpi-title">Всего позиций на мониторинге</span>
        <div class="kpi-val font-mono">{{ kpi.total }}</div>
        <div class="kpi-sub">
          🤖 <strong>{{ kpi.autoCount }}</strong> авто-сбор • 📝 <strong>{{ kpi.manualCount }}</strong> оффлайн (ручной)
        </div>
      </div>

      <div class="kpi-card" [class.emerald]="kpi.avgDelta <= 0.5" [class.ruby]="kpi.avgDelta > 0.5">
        <div class="kpi-top-row">
          <span class="kpi-title">Суточная динамика авто-корзины (24ч)</span>
          <span class="auto-tag">Online Only</span>
        </div>
        <div class="kpi-val font-mono" [style.color]="kpi.avgDelta > 0.5 ? 'var(--accent-ruby)' : 'var(--accent-emerald)'">
          {{ kpi.avgDelta > 0 ? '+' : '' }}{{ kpi.avgDelta }}%
        </div>
        <div class="kpi-sub">
          Рассчитано строго по <strong>{{ kpi.autoCount }}</strong> онлайн-витринам (ручной ввод исключен)
        </div>
      </div>

      <div class="kpi-card cyan">
        <span class="kpi-title">Каналы сбора котировок</span>
        <div class="kpi-val font-mono">{{ kpi.sourcesCount }} каналов</div>
        <div class="kpi-sub">METRO, Arbuz, Magnum, Kaspi, Satu, Bifi + Базары</div>
      </div>

      <div class="kpi-card emerald">
        <span class="kpi-title">Интеграция с Master ERP</span>
        <div class="kpi-val font-mono" style="font-size:1.15rem; margin-top:12px;">{{ svc.syncStatus() }}</div>
        <div class="kpi-sub">Таблица <code>raw_material_prices</code> (MySQL)</div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .kpi-card::before {
      content: "";
      position: absolute;
      top: 0; left: 0; width: 4px; height: 100%;
      background: var(--accent-amber);
    }
    .kpi-card.emerald::before { background: var(--accent-emerald); }
    .kpi-card.cyan::before { background: var(--accent-cyan); }
    .kpi-card.gold::before { background: var(--accent-gold); }
    .kpi-card.ruby::before { background: var(--accent-ruby); }

    .kpi-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .auto-tag {
      font-size: 0.65rem;
      background: rgba(39, 174, 96, 0.15);
      color: #2ecc71;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .kpi-title { font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-muted); font-weight: 700; }
    .kpi-val { font-size: 1.6rem; font-weight: 700; color: #fff; margin: 6px 0 2px; }
    .kpi-sub { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35; }
    .kpi-sub strong { color: #fff; }
  `]
})
export class KpiStripComponent {
  svc = inject(MarketMonitorService);
}
