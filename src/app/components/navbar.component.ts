import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="container header-inner">
        <div class="logo-area">
          <span class="brand-badge">MOOD</span>
          <div class="logo-text">
            <h1>Price Intelligence & Raw Material Monitor</h1>
            <p>Холдинг MOOD GROUP • Алматы • Архитектура Angular 18 + PHP/MySQL (PS.kz)</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="svc.openLogsModal()">
            📜 Журнал аудита логов
          </button>
          <button class="btn btn-primary" (click)="svc.openFastEntryModal()">
            ⚡ Быстрый ввод котировки
          </button>
          <button class="btn btn-cyan" (click)="onCrawl()">
            🔄 Автопарсинг
          </button>
          <button class="btn btn-emerald" (click)="onSync()">
            🚀 Перенос в ERP
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .logo-area { display: flex; align-items: center; gap: 14px; }
    .brand-badge {
      background: var(--accent-amber);
      color: #fff;
      font-weight: 800;
      font-size: 1.1rem;
      padding: 6px 12px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .logo-text h1 { font-size: 1.12rem; font-weight: 700; color: #fff; }
    .logo-text p { font-size: 0.76rem; color: var(--text-secondary); }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  `]
})
export class NavbarComponent {
  svc = inject(MarketMonitorService);

  async onCrawl() {
    await this.svc.triggerDailyCrawl();
  }

  async onSync() {
    await this.svc.syncWithErp();
  }
}
