import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-audit-logs-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isLogModalOpen()" (click)="svc.closeLogsModal()">
      <div class="modal-box modal-box-large" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h3>📜 Журнал аудита получения цен (г. Алматы)</h3>
            <p>Фиксация источников, времени, методов сбора и прямых ссылок на витрины</p>
          </div>
          <button class="close-btn" (click)="svc.closeLogsModal()">&times;</button>
        </div>

        <div class="modal-body">
          <table>
            <thead>
              <tr>
                <th>Время (Timestamp)</th>
                <th>Сырье</th>
                <th>Источник</th>
                <th style="text-align:right;">Цена (₸)</th>
                <th style="text-align:center;">Метод</th>
                <th style="text-align:center;">Статус</th>
                <th>Ссылка на источник</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let l of svc.acquisitionLogs()">
                <td class="font-mono text-muted" style="font-size:0.75rem;">
                  {{ l.timestamp.replace('T', ' ').substring(0, 19) }}
                </td>
                <td><strong>{{ l.item_name || l.code }}</strong></td>
                <td><span style="color:var(--accent-gold); font-size:0.78rem;">{{ l.source_name }}</span></td>
                <td class="font-mono" style="text-align:right; font-weight:700; color:var(--accent-emerald);">
                  {{ svc.formatMoney(l.price_kzt) }}
                </td>
                <td style="text-align:center;">
                  <span class="badge" [ngClass]="l.method === 'AUTO_CRAWL' ? 'badge-cyan' : 'badge-amber'">
                    {{ l.method === 'AUTO_CRAWL' ? '🤖 AUTO CRAWL' : '✍️ MANUAL ENTRY' }}
                  </span>
                </td>
                <td style="text-align:center;">
                  <span class="badge badge-emerald">✔ 200 OK</span>
                </td>
                <td>
                  <a [href]="l.url" target="_blank" rel="noopener noreferrer" class="source-link">
                    🔗 {{ l.url ? l.url.substring(0, 38) + '...' : 'нет URL' }} ↗
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
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
      width: 1040px;
      max-width: 95%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
    }
    .modal-header h3 { font-size: 1.15rem; color: #fff; }
    .modal-header p { font-size: 0.75rem; color: var(--text-secondary); }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; }
    .close-btn:hover { color: #fff; }
    .modal-body { overflow-y: auto; flex: 1; padding-right: 6px; }
    .modal-footer { margin-top: 16px; display: flex; justify-content: flex-end; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th {
      background: var(--bg-surface);
      color: var(--text-muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-strong);
    }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); }
    .source-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.75rem;
      padding: 2px 6px;
      background: var(--accent-cyan-soft);
      border-radius: 4px;
    }
  `]
})
export class AuditLogsModalComponent {
  svc = inject(MarketMonitorService);
}
