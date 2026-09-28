import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar.component';
import { KpiStripComponent } from './components/kpi-strip.component';
import { PriceChartComponent } from './components/price-chart.component';
import { PricesTableComponent } from './components/prices-table.component';
import { AuditLogsModalComponent } from './components/audit-logs-modal.component';
import { FastEntryModalComponent } from './components/fast-entry-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    KpiStripComponent,
    PriceChartComponent,
    PricesTableComponent,
    AuditLogsModalComponent,
    FastEntryModalComponent
  ],
  template: `
    <div class="app-layout">
      <app-navbar></app-navbar>

      <main class="container">
        <app-kpi-strip></app-kpi-strip>
        <app-price-chart></app-price-chart>
        <app-prices-table></app-prices-table>
      </main>

      <app-audit-logs-modal></app-audit-logs-modal>
      <app-fast-entry-modal></app-fast-entry-modal>

      <footer class="app-footer">
        <div class="container footer-flex">
          <div>
            <strong>MOOD Raw Material Price Monitor</strong> • Архитектура Angular 18 + PHP/MySQL (PS.kz)
          </div>
          <div>
            г. Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3) • Холдинг MOOD GROUP
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
    main { flex: 1; padding-top: 10px; }
    .app-footer {
      border-top: 1px solid var(--border-subtle);
      padding: 20px 0;
      background: var(--bg-surface);
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .footer-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
  `]
})
export class AppComponent {}
