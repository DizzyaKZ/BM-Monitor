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
          <button 
            (click)="onResetDatabase()"
            [disabled]="isResetting"
            title="Полный сброс и повторная чистая инициализация базы данных с верифицированными поставщиками"
            class="btn btn-rose">
            <span>{{ isResetting ? 'Сброс...' : '⚡ Сброс и чистая БД' }}</span>
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
    .btn-rose {
      background: rgba(225, 29, 72, 0.2);
      border: 1px solid rgba(244, 63, 94, 0.4);
      color: #fda4af;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-rose:hover {
      background: rgba(225, 29, 72, 0.4);
      color: #fff;
      border-color: #f43f5e;
    }
    .btn-rose:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class NavbarComponent {
  svc = inject(MarketMonitorService);
  isResetting = false;

  async onCrawl() {
    await this.svc.triggerDailyCrawl();
  }

  async onSync() {
    await this.svc.syncWithErp();
  }

  async onResetDatabase() {
    const confirmed = confirm(
      '⚠️ ВНИМАНИЕ: Вы действительно хотите сбросить старые значения и произвести полное инициирование новых чистых данных?\n\n' +
      '• Все таблицы MySQL будут очищены (TRUNCATE)\n' +
      '• Будут загружены 43 проверенные позиции сырья с реальными поставщиками (Алтын Орда, Зеленый Базар, METRO, Bifi.kz и др.)\n' +
      '• Ошибочные привязки (например Bifi на мясо) будут полностью устранены\n' +
      '• Будет создана 30-дневная чистая история котировок'
    );
    if (!confirmed) return;

    this.isResetting = true;
    try {
      const ok = await this.svc.resetDatabase();
      if (ok) {
        alert('✅ База данных успешно сброшена и инициализирована проверенными данными!');
      } else {
        alert('⚠️ Сброс выполнен в локальном режиме. Если MySQL на PS.kz доступна, также выполнен сброс таблиц.');
      }
    } catch (e: any) {
      alert('Ошибка при сбросе: ' + (e?.message || e));
    } finally {
      this.isResetting = false;
    }
  }
}
