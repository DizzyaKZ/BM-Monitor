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
            📜 Журнал аудита
          </button>
          <button class="btn btn-primary" (click)="svc.openFastEntryModal()">
            ⚡ Быстрый ввод
          </button>
          <button class="btn btn-cyan" (click)="onCrawl()">
            🔄 Автопарсинг
          </button>
          <button class="btn btn-emerald" (click)="onSync()">
            🚀 Перенос в ERP
          </button>
          
          <!-- Clear / Wipe Button (0 rows) -->
          <button 
            (click)="onClearDatabase()"
            [disabled]="isProcessing"
            title="Полная очистка базы данных и таблицы (0 позиций)"
            class="btn btn-outline-rose">
            <span>🗑️ Очистить таблицу</span>
          </button>

          <!-- Initialize / Seed Clean Button (43 rows) -->
          <button 
            (click)="onResetDatabase()"
            [disabled]="isProcessing"
            title="Загрузить 43 проверенные позиции сырья с актуальными поставщиками"
            class="btn btn-rose">
            <span>{{ isProcessing ? 'Загрузка...' : '⚡ Загрузить чистую БД' }}</span>
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
    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .btn-rose {
      background: rgba(225, 29, 72, 0.25);
      border: 1px solid rgba(244, 63, 94, 0.5);
      color: #fda4af;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-rose:hover {
      background: rgba(225, 29, 72, 0.45);
      color: #fff;
      border-color: #f43f5e;
    }
    .btn-outline-rose {
      background: transparent;
      border: 1px solid rgba(244, 63, 94, 0.35);
      color: #f87171;
      padding: 7px 10px;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-outline-rose:hover {
      background: rgba(225, 29, 72, 0.15);
      color: #fff;
      border-color: #f87171;
    }
    .btn-rose:disabled, .btn-outline-rose:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class NavbarComponent {
  svc = inject(MarketMonitorService);
  isProcessing = false;

  async onCrawl() {
    await this.svc.triggerDailyCrawl();
  }

  async onSync() {
    await this.svc.syncWithErp();
  }

  async onClearDatabase() {
    const confirmed = confirm(
      '⚠️ ОЧИСТИТЬ ТАБЛИЦУ?\n\n' +
      '• Все позиции сырья будут удалены из сводной таблицы и MySQL (TRUNCATE)\n' +
      '• Таблица станет полностью пустой (0 позиций)\n' +
      '• Вы сможете заполнить её заново кнопкой «Загрузить чистую БД» или ввести котировки вручную.'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.clearDatabase();
      alert('🗑️ Сводная таблица и база данных полностью очищены (0 позиций)!');
    } catch (e: any) {
      alert('Ошибка при очистке: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }

  async onResetDatabase() {
    const confirmed = confirm(
      '⚡ ЗАГРУЗИТЬ ЧИСТУЮ ЭТАЛОННУЮ БАЗУ?\n\n' +
      '• Будут загружены 43 проверенные позиции сырья холдинга MOOD GROUP\n' +
      '• Реальные поставщики в Алматы (Алтын Орда, Зеленый Базар, METRO, Bifi.kz и др.)\n' +
      '• Актуальная дата и время последнего парсинга котировок\n' +
      '• Чистая 30-дневная история цен.'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.resetDatabase();
      alert('✅ База данных успешно инициализирована 43 проверенными позициями сырья!');
    } catch (e: any) {
      alert('Ошибка при инициализации: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }
}
