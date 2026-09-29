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
            <h1>Market Price Intelligence & Benchmark</h1>
            <p>Холдинг MOOD GROUP • Алматы • Архитектура Angular 18 + PHP/MySQL (PS.kz)</p>
          </div>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="mode-tabs">
          <button 
            class="mode-btn"
            [class.active]="svc.activeMode() === 'FINISHED_PRODUCTS'"
            (click)="svc.setMonitorMode('FINISHED_PRODUCTS')">
            <span class="mode-icon">🍺</span>
            <span class="mode-title">Готовая продукция & Меню</span>
            <span class="mode-counter">{{ svc.finishedProducts().length }}</span>
          </button>

          <button 
            class="mode-btn"
            [class.active]="svc.activeMode() === 'RAW_MATERIALS'"
            (click)="svc.setMonitorMode('RAW_MATERIALS')">
            <span class="mode-icon">🥩</span>
            <span class="mode-title">Сырьё и ингредиенты</span>
            <span class="mode-counter">{{ svc.rawMaterials().length }}</span>
          </button>
        </div>

        <div class="header-actions">
          <!-- FINISHED PRODUCTS ACTIONS -->
          <ng-container *ngIf="svc.activeMode() === 'FINISHED_PRODUCTS'">
            <button class="btn btn-outline" (click)="svc.openLogsModal()" title="Открыть журнал аудита и историю фиксации цен">
              📜 Журнал аудита
            </button>
            <button class="btn btn-primary" (click)="svc.openFinishedEntryModal()">
              ➕ Добавить в меню
            </button>
            <button class="btn btn-cyan" (click)="onCrawlFinished()">
              🔄 Парсинг меню
            </button>
            <button 
              (click)="onClearFinishedDatabase()"
              [disabled]="isProcessing"
              title="Полная очистка позиций готовой продукции (0 записей)"
              class="btn btn-outline-rose">
              <span>🗑️ Очистить</span>
            </button>
            <button 
              (click)="onResetFinishedDatabase()"
              [disabled]="isProcessing"
              title="Загрузить 35 проверенных позиций меню и розницы Алматы"
              class="btn btn-rose">
              <span>{{ isProcessing ? 'Загрузка...' : '⚡ Загрузить 35 позиций' }}</span>
            </button>
          </ng-container>

          <!-- RAW MATERIALS ACTIONS -->
          <ng-container *ngIf="svc.activeMode() === 'RAW_MATERIALS'">
            <button class="btn btn-outline" (click)="svc.openLogsModal()">
              📜 Аудит
            </button>
            <button class="btn btn-primary" (click)="svc.openFastEntryModal()">
              ⚡ Быстрый ввод
            </button>
            <button class="btn btn-cyan" (click)="onCrawlRaw()">
              🔄 Автопарсинг
            </button>
            <button class="btn btn-emerald" (click)="onSync()">
              🚀 В ERP
            </button>
            <button 
              (click)="onClearRawDatabase()"
              [disabled]="isProcessing"
              title="Полная очистка таблицы сырья (0 позиций)"
              class="btn btn-outline-rose">
              <span>🗑️ Очистить</span>
            </button>
            <button 
              (click)="onResetRawDatabase()"
              [disabled]="isProcessing"
              title="Загрузить 43 проверенные позиции сырья"
              class="btn btn-rose">
              <span>{{ isProcessing ? 'Загрузка...' : '⚡ Чистая БД (43)' }}</span>
            </button>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 14px 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }
    .logo-area { display: flex; align-items: center; gap: 12px; }
    .brand-badge {
      background: var(--accent-amber);
      color: #fff;
      font-weight: 800;
      font-size: 1.05rem;
      padding: 5px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .logo-text h1 { font-size: 1.05rem; font-weight: 700; color: #fff; }
    .logo-text p { font-size: 0.72rem; color: var(--text-secondary); }

    .mode-tabs {
      display: flex;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
    }
    .mode-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn.active {
      background: var(--bg-card);
      color: #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .mode-icon { font-size: 1rem; }
    .mode-counter {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 1px 6px;
      border-radius: 10px;
      font-size: 0.7rem;
      font-family: monospace;
    }
    .mode-btn.active .mode-counter {
      background: var(--accent-amber);
      color: #fff;
    }

    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .btn-rose {
      background: rgba(225, 29, 72, 0.25);
      border: 1px solid rgba(244, 63, 94, 0.5);
      color: #fda4af;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
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
      font-size: 0.78rem;
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

  async onCrawlFinished() {
    await this.svc.triggerFinishedCrawl();
  }

  async onCrawlRaw() {
    await this.svc.triggerDailyCrawl();
  }

  async onSync() {
    await this.svc.syncWithErp();
  }

  async onClearFinishedDatabase() {
    const confirmed = confirm(
      '⚠️ ОЧИСТИТЬ ПОЗИЦИИ ГОТОВОЙ ПРОДУКЦИИ?\n\n' +
      '• Все позиции меню и розницы будут удалены из базы (0 записей)\n' +
      '• Вы сможете загрузить их заново в 1 клик.'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.clearFinishedDatabase();
      alert('🗑️ Позиции готовой продукции очищены (0 записей)!');
    } catch (e: any) {
      alert('Ошибка при очистке: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }

  async onResetFinishedDatabase() {
    const confirmed = confirm(
      '⚡ ЗАГРУЗИТЬ 35 ЭТАЛОННЫХ ПОЗИЦИЙ МЕНЮ И РОЗНИЦЫ АЛМАТЫ?\n\n' +
      '• BEERMOOD.PUB (Крафтовое пиво, колбаски, ребра BBQ, бургеры)\n' +
      '• CHEESY MOOD (Страчателла, сулугуни, адыгейский, белпер кнолле)\n' +
      '• MEAT & BREAD MOOD (Билтонг из конины/говядины, мортаделла, бекон, тартин)\n' +
      '• SPICY MOOD LAB (Шрирача, табаско, пири-пири, пряные смеси)\n' +
      '• Реальные цены конкурентов: Harat\'s, Dublin, Galmart, Hophead, Сырный Сомелье, Paul.'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.resetFinishedDatabase();
      alert('✅ Успешно загружено 35 позиций меню и розницы Алматы!');
    } catch (e: any) {
      alert('Ошибка: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }

  async onClearRawDatabase() {
    const confirmed = confirm(
      '⚠️ ОЧИСТИТЬ СЫРЬЕВУЮ ТАБЛИЦУ?\n\n' +
      '• Таблица сырья станет пустой (0 позиций)'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.clearDatabase();
      alert('🗑️ Таблица сырья очищена (0 позиций)!');
    } catch (e: any) {
      alert('Ошибка при очистке: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }

  async onResetRawDatabase() {
    const confirmed = confirm(
      '⚡ ЗАГРУЗИТЬ 43 ПОЗИЦИИ СЫРЬЯ MOOD GROUP?'
    );
    if (!confirmed) return;

    this.isProcessing = true;
    try {
      await this.svc.resetDatabase();
      alert('✅ 43 позиции сырья успешно загружены!');
    } catch (e: any) {
      alert('Ошибка при загрузке: ' + (e?.message || e));
    } finally {
      this.isProcessing = false;
    }
  }
}
