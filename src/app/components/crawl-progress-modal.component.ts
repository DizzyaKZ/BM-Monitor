import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-crawl-progress-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isCrawlModalOpen()" (click)="onBackdropClick()">
      <div class="modal-box crawl-box" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title-box">
            <span class="status-indicator" [class.running]="svc.isCrawling()" [class.done]="!svc.isCrawling()"></span>
            <div>
              <h3 *ngIf="svc.crawlTargetMode() === 'BEER'">🍺 Ход выполнения автопарсинга пивной карты (BEERMOOD.PUB)</h3>
              <h3 *ngIf="svc.crawlTargetMode() === 'FINISHED'">🍽️ Ход выполнения автопарсинга кухни и продукции</h3>
              <h3 *ngIf="svc.crawlTargetMode() === 'RAW'">🔄 Ход выполнения автопарсинга сырья и B2B поставок</h3>
              
              <p *ngIf="svc.crawlTargetMode() === 'BEER'">Опрос крафтовых баров, пабов и ботлшопов Алматы (Harat's, Chechil, Dublin, Line Brew, Hophead, Baza Craft)</p>
              <p *ngIf="svc.crawlTargetMode() === 'FINISHED'">Опрос меню ресторанов, крафтовых лавок и супермаркетов Алматы</p>
              <p *ngIf="svc.crawlTargetMode() === 'RAW'">Опрос оптовых рынков, гипермаркетов и B2B порталов («Алтын Орда», «Зеленый Базар», METRO, Satu.kz)</p>
            </div>
          </div>
          <button class="close-btn" [disabled]="svc.isCrawling()" (click)="svc.closeCrawlModal()">&times;</button>
        </div>

        <!-- Progress Section -->
        <div class="progress-section">
          <div class="progress-labels">
            <span>
              <strong>Статус:</strong>
              <span *ngIf="svc.isCrawling()" class="text-amber"> Сбор котировок... ({{ svc.crawlCurrentItem() }})</span>
              <span *ngIf="!svc.isCrawling()" class="text-emerald"> ✔ Автопарсинг успешно завершен</span>
            </span>
            <span class="font-mono font-bold">{{ svc.crawlProgress() }}%</span>
          </div>

          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="svc.crawlProgress()"></div>
          </div>

          <div class="progress-meta" *ngIf="svc.isCrawling()">
            <span>Канал: <strong class="text-gold">{{ svc.crawlCurrentSource() }}</strong></span>
            <span>Обработано позиций: <strong>{{ svc.crawlProcessedCount() }} из {{ svc.crawlTotalTargetCount() }}</strong></span>
          </div>
        </div>

        <!-- Live Terminal Stream -->
        <div class="terminal-wrapper">
          <div class="terminal-header">
            <span>🖥️ Журнал запросов в реальном времени</span>
            <span class="font-mono text-muted">{{ svc.crawlConsoleLogs().length }} событий</span>
          </div>
          <div class="terminal-body" #terminalBody>
            <div class="terminal-line" *ngFor="let log of svc.crawlConsoleLogs()">
              <span class="t-time font-mono">[{{ log.time }}]</span>
              <span class="t-code badge font-mono">{{ log.code }}</span>
              <span class="t-name">{{ log.name }}</span>
              <span class="t-src text-gold">[{{ log.source }}]</span>
              <span class="t-price font-mono text-emerald font-bold">{{ svc.formatMoney(log.price) }}</span>
              <a *ngIf="log.url" [href]="log.url" target="_blank" rel="noopener noreferrer" class="badge badge-cyan font-mono" style="text-decoration:none; font-size:0.68rem;" title="Открыть источник цены">🔗 URL ↗</a>
              <span class="t-status badge badge-emerald font-mono">{{ log.status }}</span>
              <span class="t-ms font-mono text-muted">{{ log.ms }}ms</span>
            </div>
            <div *ngIf="svc.crawlConsoleLogs().length === 0" class="terminal-empty">
              Инициализация парсера и соединений с источниками...
            </div>
          </div>
        </div>

        <!-- Summary Report (Appears when done) -->
        <div class="summary-section" *ngIf="!svc.isCrawling() && svc.crawlResultSummary() as sum">
          <div class="sum-title">📊 Итоговый отчет сбора котировок ({{ sum.completedAt }})</div>
          
          <div class="sum-grid">
            <div class="sum-card">
              <span class="lbl">{{ svc.crawlTargetMode() === 'BEER' ? 'Сортов пива в меню:' : 'Обновлено позиций:' }}</span>
              <strong class="text-gold">{{ sum.total }} из {{ sum.total }}</strong>
            </div>
            <div class="sum-card">
              <span class="lbl">{{ svc.crawlTargetMode() === 'BEER' ? 'Опрошено баров Алматы:' : 'Опрошено каналов:' }}</span>
              <strong class="text-cyan">{{ sum.sourcesCount }} заведений</strong>
            </div>
            <div class="sum-card">
              <span class="lbl">Записано в аудит цен:</span>
              <strong class="text-emerald">+{{ sum.updatedLogsCount }} записей с URL</strong>
            </div>
            <div class="sum-card" *ngIf="svc.crawlTargetMode() === 'BEER'">
              <span class="lbl">Ср. маржа пролива:</span>
              <strong class="text-emerald">{{ svc.beerKpiSummary().avgMarginPct }}%</strong>
            </div>
            <div class="sum-card" *ngIf="svc.crawlTargetMode() !== 'BEER'">
              <span class="lbl">Динамика цен:</span>
              <strong [style.color]="sum.avgBasketDelta > 0 ? 'var(--accent-ruby)' : 'var(--accent-emerald)'">
                {{ sum.avgBasketDelta > 0 ? '+' : '' }}{{ sum.avgBasketDelta }}%
              </strong>
            </div>
          </div>

          <!-- Price Alerts -->
          <div class="alerts-box" *ngIf="sum.alerts.length > 0">
            <div class="alerts-hdr">⚠️ Зафиксированы заметные колебания цен (> 1.5%):</div>
            <div class="alert-chips">
              <span class="alert-chip" *ngFor="let a of sum.alerts">
                <strong>{{ a.name }}</strong>: 
                {{ svc.formatMoney(a.oldPrice) }} → {{ svc.formatMoney(a.newPrice) }} 
                <span [class.text-ruby]="a.deltaPct > 0" [class.text-emerald]="a.deltaPct < 0">
                  ({{ a.deltaPct > 0 ? '▲ +' : '▼ ' }}{{ a.deltaPct }}%)
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="btn btn-outline" [disabled]="svc.isCrawling()" (click)="svc.closeCrawlModal()">
            Закрыть
          </button>
          <button class="btn btn-cyan" [disabled]="svc.isCrawling()" (click)="onOpenLogsFromModal()">
            📜 Посмотреть журнал аудита
          </button>
          <button class="btn btn-emerald" [disabled]="svc.isCrawling()" (click)="onSyncFromModal()">
            🚀 Перенести актуальные цены в Master ERP
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
    }
    .crawl-box {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      width: 920px;
      max-width: 95%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-shadow: 0 12px 35px rgba(0,0,0,0.8);
    }
    .header-title-box { display: flex; align-items: center; gap: 12px; }
    .status-indicator {
      width: 12px; height: 12px; border-radius: 50%; display: inline-block;
      background: var(--accent-amber);
    }
    .status-indicator.running {
      animation: pulse 1s infinite alternate;
      background: var(--accent-amber);
      box-shadow: 0 0 10px var(--accent-amber);
    }
    .status-indicator.done {
      background: var(--accent-emerald);
      box-shadow: 0 0 10px var(--accent-emerald);
    }
    @keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .modal-header h3 { font-size: 1.15rem; color: #fff; }
    .modal-header p { font-size: 0.76rem; color: var(--text-secondary); }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .close-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Progress Bar */
    .progress-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 16px;
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.84rem;
      margin-bottom: 8px;
    }
    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background: #2b2723;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-amber), var(--accent-emerald));
      transition: width 0.15s ease;
    }
    .progress-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      color: var(--text-secondary);
      margin-top: 8px;
    }

    /* Terminal Console */
    .terminal-wrapper {
      background: #080807;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      height: 230px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .terminal-header {
      background: var(--bg-surface-elevated);
      padding: 6px 12px;
      font-size: 0.74rem;
      color: var(--text-secondary);
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }
    .terminal-body {
      padding: 10px;
      overflow-y: auto;
      flex: 1;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      line-height: 1.6;
    }
    .terminal-line {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      margin-bottom: 4px;
    }
    .t-time { color: var(--text-muted); font-size: 0.7rem; }
    .t-name { color: #f5efe8; }
    .t-src { font-size: 0.72rem; }
    .terminal-empty { color: var(--text-muted); padding: 10px; text-align: center; }

    /* Summary */
    .summary-section {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--accent-emerald-soft);
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 16px;
    }
    .sum-title { font-size: 0.86rem; font-weight: 700; color: #fff; margin-bottom: 10px; }
    .sum-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 10px;
    }
    .sum-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
    }
    .sum-card .lbl { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px; }
    .sum-card strong { font-size: 0.95rem; color: #fff; }

    .alerts-box {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--border-subtle);
    }
    .alerts-hdr { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px; }
    .alert-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .alert-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-strong);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.74rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .text-amber { color: var(--accent-amber); }
    .text-emerald { color: var(--accent-emerald); }
    .text-cyan { color: var(--accent-cyan); }
    .text-gold { color: var(--accent-gold); }
    .text-ruby { color: var(--accent-ruby); }
  `]
})
export class CrawlProgressModalComponent {
  svc = inject(MarketMonitorService);

  onBackdropClick() {
    if (!this.svc.isCrawling()) {
      this.svc.closeCrawlModal();
    }
  }

  async onSyncFromModal() {
    await this.svc.syncWithErp();
    this.svc.closeCrawlModal();
  }

  onOpenLogsFromModal() {
    this.svc.closeCrawlModal();
    this.svc.openLogsModal();
  }
}
