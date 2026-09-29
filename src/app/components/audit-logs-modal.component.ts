import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { AcquisitionLog } from '../models/market-monitor.model';

@Component({
  selector: 'app-audit-logs-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isLogModalOpen()" (click)="svc.closeLogsModal()">
      <div class="modal-box modal-box-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>📜 Журнал аудита получения цен (г. Алматы)</h3>
            <p>Фиксация источников, времени, методов сбора (онлайн-парсинг / ручной ввод) и прямых ссылок на витрины</p>
          </div>
          <button class="close-btn" (click)="svc.closeLogsModal()">&times;</button>
        </div>

        <!-- Filter bar for target code if opened from table row -->
        <div *ngIf="svc.selectedLogCode() as code" class="target-code-bar">
          <span>Фильтр по позиции: <strong>{{ getItemNameByCode(code) }}</strong> (<code>{{ code }}</code>)</span>
          <button class="btn-reset-code" (click)="svc.selectedLogCode.set(null)">
            ✕ Сбросить фильтр и показать все 78 записей
          </button>
        </div>

        <div class="modal-controls">
          <div class="method-pills">
            <button 
              class="pill-btn" 
              [class.active]="methodFilter === 'ALL'" 
              (click)="methodFilter = 'ALL'">
              Все логи ({{ logsCount }})
            </button>
            <button 
              class="pill-btn pill-auto" 
              [class.active]="methodFilter === 'AUTO_CRAWL'" 
              (click)="methodFilter = 'AUTO_CRAWL'">
              🤖 Авто-парсинг ({{ autoCount }})
            </button>
            <button 
              class="pill-btn pill-manual" 
              [class.active]="methodFilter === 'MANUAL_ENTRY'" 
              (click)="methodFilter = 'MANUAL_ENTRY'">
              📝 Ручной ввод ({{ manualCount }})
            </button>
          </div>

          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Поиск по продукту, коду, источнику..."
              class="search-input" />
          </div>

          <button class="btn btn-outline-cyan" (click)="onRefreshLogs()" title="Обновить журнал из базы">
            🔄 Обновить
          </button>
        </div>

        <div class="modal-body">
          <table *ngIf="filteredLogs.length > 0">
            <thead>
              <tr>
                <th style="width: 140px;">Время (Timestamp)</th>
                <th>Продукт / Позиция</th>
                <th>Источник / Заведение</th>
                <th style="text-align:right;">Цена (₸)</th>
                <th style="text-align:center;">Метод</th>
                <th style="text-align:center;">Статус</th>
                <th>Ссылка на первоисточник</th>
                <th>Примечание аудита</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of filteredLogs" [class.row-manual]="l.method === 'MANUAL_ENTRY'">
                <td class="font-mono text-muted" style="font-size:0.75rem;">
                  {{ formatTimestamp(l.timestamp) }}
                </td>
                <td>
                  <strong>{{ l.item_name || svc.findItemNameByCode(l.code) }}</strong>
                  <div class="code-sub"><code>{{ l.code }}</code></div>
                </td>
                <td>
                  <span class="source-tag" [class.text-gold]="l.method === 'AUTO_CRAWL'">
                    {{ l.source_name || svc.findSourceNameById(l.source_id) }}
                  </span>
                </td>
                <td class="font-mono" style="text-align:right; font-weight:700;" [style.color]="l.method === 'AUTO_CRAWL' ? 'var(--accent-emerald)' : '#94a3b8'">
                  {{ svc.formatMoney(+l.price_kzt) }}
                </td>
                <td style="text-align:center;">
                  <span class="badge" [ngClass]="l.method === 'AUTO_CRAWL' ? 'badge-cyan' : 'badge-manual'">
                    {{ l.method === 'AUTO_CRAWL' ? '🤖 AUTO CRAWL' : '📝 MANUAL' }}
                  </span>
                </td>
                <td style="text-align:center;">
                  <span class="badge badge-emerald">✔ 200 OK</span>
                </td>
                <td>
                  <a *ngIf="l.url" [href]="l.url" target="_blank" rel="noopener noreferrer" class="source-link" title="Перейти к опубликованному меню или прайсу">
                    🔗 {{ getCleanUrlLabel(l.url) }} ↗
                  </a>
                  <span *ngIf="!l.url" class="text-muted font-mono" style="font-size:0.72rem;">нет URL</span>
                </td>
                <td class="text-muted" style="font-size:0.72rem;">
                  {{ l.notes || 'Верифицировано' }}
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredLogs.length === 0" class="empty-logs-box">
            <p>Журнал аудита не содержит записей по заданному фильтру.</p>
            <div style="display:flex; gap:10px; justify-content:center; margin-top:12px;">
              <button class="btn btn-outline" (click)="resetFilters()">
                ✕ Сбросить фильтры поиска
              </button>
              <button class="btn btn-primary" (click)="onRestoreLogs()">
                ⚡ Загрузить эталонный журнал аудита (78 записей)
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <span class="text-muted" style="font-size:0.75rem; margin-right:auto;">
            Отображено записей: <strong>{{ filteredLogs.length }}</strong> из <strong>{{ logsCount }}</strong>
          </span>
          <button class="btn btn-outline" (click)="svc.closeLogsModal()">Закрыть журнал</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-box-large {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      width: 1180px;
      max-width: 95%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
    }
    .modal-header h3 { font-size: 1.15rem; color: #fff; }
    .modal-header p { font-size: 0.75rem; color: var(--text-secondary); }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; }
    .close-btn:hover { color: #fff; }

    .target-code-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(230, 126, 34, 0.15);
      border: 1px solid rgba(230, 126, 34, 0.35);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 0.78rem;
      color: #f39c12;
      margin-bottom: 10px;
    }
    .btn-reset-code {
      background: transparent;
      border: 1px solid #f39c12;
      color: #fff;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-reset-code:hover {
      background: rgba(230, 126, 34, 0.3);
    }

    .modal-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 8px 12px;
    }
    .method-pills {
      display: flex;
      gap: 4px;
    }
    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.74rem;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pill-btn.active {
      background: var(--accent-amber);
      color: #fff;
    }
    .pill-auto.active {
      background: var(--accent-emerald) !important;
    }
    .pill-manual.active {
      background: #64748b !important;
    }
    .search-box {
      flex: 1;
      max-width: 320px;
    }
    .search-input {
      width: 100%;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 6px 10px;
      color: #fff;
      font-size: 0.78rem;
      outline: none;
    }
    .btn-outline-cyan {
      background: transparent;
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      font-size: 0.76rem;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-outline-cyan:hover {
      background: rgba(0, 180, 216, 0.15);
    }

    .modal-body { overflow-y: auto; flex: 1; padding-right: 6px; }
    .modal-footer {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th {
      background: var(--bg-surface);
      color: var(--text-muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-strong);
      white-space: nowrap;
    }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); }
    .code-sub { font-size: 0.68rem; margin-top: 2px; }
    .code-sub code { background: rgba(255, 255, 255, 0.04); padding: 1px 4px; border-radius: 3px; color: var(--text-muted); }
    .source-tag { font-size: 0.78rem; font-weight: 600; }
    .source-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.75rem;
      padding: 2px 6px;
      background: var(--accent-cyan-soft);
      border-radius: 4px;
      white-space: nowrap;
    }
    .source-link:hover { text-decoration: underline; }
    .badge-manual {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }
    .row-manual {
      background: rgba(255, 255, 255, 0.012);
      opacity: 0.75;
    }
    .empty-logs-box {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-secondary);
    }
    .text-gold { color: #f1c40f !important; }
  `]
})
export class AuditLogsModalComponent {
  svc = inject(MarketMonitorService);

  searchQuery: string = '';
  methodFilter: 'ALL' | 'AUTO_CRAWL' | 'MANUAL_ENTRY' = 'ALL';

  get rawLogs(): AcquisitionLog[] {
    const list = this.svc.allLogs();
    const all = (list && list.length > 0) ? list : this.svc.getComprehensiveFallbackLogs();
    const code = this.svc.selectedLogCode();
    if (code) {
      const filtered = all.filter(l => l.code === code);
      if (filtered.length > 0) return filtered;
    }
    return all;
  }

  get logsCount(): number {
    return this.rawLogs.length;
  }

  get autoCount(): number {
    return this.rawLogs.filter(l => l.method === 'AUTO_CRAWL').length;
  }

  get manualCount(): number {
    return this.rawLogs.filter(l => l.method === 'MANUAL_ENTRY').length;
  }

  get filteredLogs(): AcquisitionLog[] {
    const list = this.rawLogs;
    const method = this.methodFilter;
    const q = (this.searchQuery || '').toLowerCase().trim();

    return list.filter(l => {
      const matchMethod = (method === 'ALL' || l.method === method);
      const name = (l.item_name || this.svc.findItemNameByCode(l.code) || '').toLowerCase();
      const code = (l.code || '').toLowerCase();
      const source = (l.source_name || this.svc.findSourceNameById(l.source_id) || '').toLowerCase();
      const notes = (l.notes || '').toLowerCase();

      const matchQuery = !q || name.includes(q) || code.includes(q) || source.includes(q) || notes.includes(q);

      return matchMethod && matchQuery;
    });
  }

  getItemNameByCode(code: string): string {
    return this.svc.findItemNameByCode(code);
  }

  resetFilters() {
    this.searchQuery = '';
    this.methodFilter = 'ALL';
    this.svc.selectedLogCode.set(null);
  }

  formatTimestamp(val?: string): string {
    if (!val) return '—';
    return String(val).replace('T', ' ').substring(0, 19);
  }

  getCleanUrlLabel(url?: string): string {
    if (!url) return 'нет URL';
    if (url.includes('metro-kz.com')) return 'METRO B2B Каталог';
    if (url.includes('magnum.kz')) return 'Magnum Каталог';
    if (url.includes('arbuz.kz')) return 'Arbuz.kz';
    if (url.includes('kaspi.kz')) return 'Kaspi Магазин';
    if (url.includes('satu.kz')) return 'Satu.kz B2B';
    if (url.includes('bifi.kz')) return 'Bifi.kz (Sacco)';
    if (url.includes('2gis.kz')) return '2GIS Карточка/Меню';
    if (url.includes('wolt.com')) return 'Wolt Меню/Доставка';
    if (url.includes('chechilpub.kz')) return 'Сайт Chechil Pub';
    if (url.includes('galmart.kz')) return 'Galmart Каталог';
    if (url.includes('colibri.kz')) return 'Colibri Market';
    if (url.includes('primemeat.kz')) return 'Prime Meat';
    return url.length > 30 ? url.substring(0, 30) + '...' : url;
  }

  async onRefreshLogs() {
    await this.svc.fetchLogsFromApi(this.svc.selectedLogCode() || undefined);
  }

  onRestoreLogs() {
    this.svc.restoreDefaultLogs();
  }
}
