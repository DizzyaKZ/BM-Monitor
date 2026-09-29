import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from './services/market-monitor.service';
import { NavbarComponent } from './components/navbar.component';
import { KpiStripComponent } from './components/kpi-strip.component';
import { PriceChartComponent } from './components/price-chart.component';
import { PricesTableComponent } from './components/prices-table.component';
import { FinishedKpiStripComponent } from './components/finished-kpi-strip.component';
import { FinishedBenchmarkChartComponent } from './components/finished-benchmark-chart.component';
import { FinishedTableComponent } from './components/finished-table.component';
import { AuditLogsModalComponent } from './components/audit-logs-modal.component';
import { FastEntryModalComponent } from './components/fast-entry-modal.component';
import { CrawlProgressModalComponent } from './components/crawl-progress-modal.component';
import { FinishedEntryModalComponent } from './components/finished-entry-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    KpiStripComponent,
    PriceChartComponent,
    PricesTableComponent,
    FinishedKpiStripComponent,
    FinishedBenchmarkChartComponent,
    FinishedTableComponent,
    AuditLogsModalComponent,
    FastEntryModalComponent,
    CrawlProgressModalComponent,
    FinishedEntryModalComponent
  ],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>

      <main class="container">
        <!-- MODE 1: ГОТОВАЯ ПРОДУКЦИЯ И МЕНЮ КОНКУРЕНТОВ -->
        <ng-container *ngIf="svc.activeMode() === 'FINISHED_PRODUCTS'">
          <app-finished-kpi-strip></app-finished-kpi-strip>
          <app-finished-benchmark-chart></app-finished-benchmark-chart>
          <app-finished-table></app-finished-table>
        </ng-container>

        <!-- MODE 2: СЫРЬЁ И ИНГРЕДИЕНТЫ -->
        <ng-container *ngIf="svc.activeMode() === 'RAW_MATERIALS'">
          <app-kpi-strip></app-kpi-strip>
          <app-price-chart></app-price-chart>
          <app-prices-table></app-prices-table>
        </ng-container>
      </main>

      <!-- MODALS -->
      <app-audit-logs-modal></app-audit-logs-modal>
      <app-fast-entry-modal></app-fast-entry-modal>
      <app-crawl-progress-modal></app-crawl-progress-modal>
      <app-finished-entry-modal></app-finished-entry-modal>

      <footer class="app-footer">
        <div class="container footer-flex">
          <div>
            <strong>BEERMOOD Market Intelligence & Price Monitor</strong> • Архитектура Angular 18 + PHP/MySQL (PS.kz)
          </div>
          <div>
            Холдинг MOOD GROUP (BEERMOOD.PUB, CHEESY MOOD, MEAT & BREAD, SPICY MOOD LAB)
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    main {
      flex: 1;
      padding-top: 24px;
      padding-bottom: 40px;
    }
    .app-footer {
      background: var(--bg-surface);
      border-top: 1px solid var(--border-subtle);
      padding: 16px 0;
      font-size: 0.76rem;
      color: var(--text-secondary);
    }
    .footer-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  `]
})
export class AppComponent {
  svc = inject(MarketMonitorService);
}
