import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { PdfMenuParsedItem, PdfRemoteParseResult } from '../models/market-monitor.model';

@Component({
  selector: 'app-pdf-menu-parser-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isPdfParserModalOpen()" (click)="svc.closePdfParserModal()">
      <div class="modal-box modal-box-large" (click)="$event.stopPropagation()">
        
        <!-- HEADER -->
        <div class="modal-header">
          <div class="header-title">
            <span class="header-icon">📄</span>
            <div>
              <h3>Парсинг PDF-меню с удаленных серверов</h3>
              <p>Загрузка файлов меню (.pdf) с внешних сайтов, извлечение позиций и интеллектуальная авто-классификация по каталогу MOOD GROUP</p>
            </div>
          </div>
          <button class="close-btn" (click)="svc.closePdfParserModal()">&times;</button>
        </div>

        <!-- INPUT / URL CONTROLS -->
        <div class="parser-controls">
          <div class="url-input-row">
            <div class="input-wrap">
              <label>Прямой URL файла PDF на удаленном сервере:</label>
              <input 
                type="url" 
                [(ngModel)]="pdfUrl" 
                placeholder="https://domain.kz/docs/bar_menu_2026.pdf" 
                class="form-input font-mono" />
            </div>

            <div class="input-wrap venue-wrap">
              <label>Заведение / Поставщик:</label>
              <input 
                type="text" 
                [(ngModel)]="customVenue" 
                placeholder="Авто-определение или укажите название" 
                class="form-input" />
            </div>

            <button 
              class="btn btn-emerald parse-btn" 
              (click)="onParsePdf()" 
              [disabled]="!pdfUrl.trim() || isParsing">
              <span *ngIf="!isParsing">⚡ Скачать и распарсить PDF</span>
              <span *ngIf="isParsing">⏳ Анализ документа...</span>
            </button>
          </div>

          <!-- Quick presets from real Almaty venues & B2B suppliers -->
          <div class="presets-row">
            <span class="preset-label">Быстрые пресеты удаленных PDF:</span>
            <button 
              type="button" 
              class="preset-chip" 
              (click)="selectPreset('https://linebrew.kz/downloads/bar_menu_almaty_2026.pdf', 'Line Brew Bar & Grill')">
              🍺 Line Brew Bar (PDF)
            </button>
            <button 
              type="button" 
              class="preset-chip" 
              (click)="selectPreset('https://harats.kz/assets/docs/craft_beer_prices.pdf', 'Harat\\'s Irish Pub Almaty')">
              ☘️ Harat's Pub (PDF)
            </button>
            <button 
              type="button" 
              class="preset-chip" 
              (click)="selectPreset('https://metro-kz.com/catalogs/horeca_meat_dairy_b2b.pdf', 'METRO Cash & Carry B2B')">
              🥩 METRO HoReCa B2B (PDF)
            </button>
            <button 
              type="button" 
              class="preset-chip" 
              (click)="selectPreset('https://bifi.kz/catalogs/cheese_sacco_price_2026.pdf', 'Bifi.kz / Vernal (Сыры & Закваски)')">
              🧀 Сырный Сомелье (PDF)
            </button>
            <button 
              type="button" 
              class="preset-chip" 
              (click)="selectPreset('https://chechilpub.kz/docs/menu_kitchen_bar.pdf', 'Chechil Pub Almaty')">
              🍔 Chechil Pub (PDF)
            </button>
          </div>
        </div>

        <!-- PROGRESS LOADER -->
        <div class="loader-box" *ngIf="isParsing">
          <div class="loader-spinner"></div>
          <div class="loader-text">
            <strong>Загрузка удаленного PDF-файла и выполнение OCR/Text-Extraction...</strong>
            <p>Парсинг табличных структур, извлечение цен в KZT и семантическое сопоставление с каталогом продуктов BEERMOOD</p>
          </div>
        </div>

        <!-- NOTIFICATION BANNER -->
        <div *ngIf="notificationMsg" class="alert-success">
          {{ notificationMsg }}
        </div>

        <!-- PARSED RESULT DASHBOARD -->
        <div class="parsed-content" *ngIf="parseResult && !isParsing">
          
          <!-- Document metadata bar -->
          <div class="doc-meta-card">
            <div class="meta-item">
              <span class="meta-label">Заведение / Источник:</span>
              <strong class="text-gold">{{ parseResult.venue_name }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">Файл на сервере:</span>
              <code class="text-cyan">{{ parseResult.pdf_file_name }}</code>
            </div>
            <div class="meta-item">
              <span class="meta-label">Размер / Страниц:</span>
              <span>{{ parseResult.file_size_kb }} КБ • {{ parseResult.pages_count }} стр.</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Ответ сервера:</span>
              <span class="badge badge-emerald">HTTP {{ parseResult.http_status }} ({{ parseResult.response_time_ms }} мс)</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Авто-классификация:</span>
              <strong class="text-emerald">{{ parseResult.classified_items_count }} из {{ parseResult.total_items_found }} ({{ calcClassificationRate() }}%)</strong>
            </div>
          </div>

          <!-- FILTER & SELECTION BAR -->
          <div class="table-toolbar">
            <div class="filter-actions">
              <label class="select-all-label">
                <input type="checkbox" [checked]="isAllSelected" (change)="toggleSelectAll()" />
                <span>Выбрать все ({{ selectedCount }} из {{ parseResult.items.length }})</span>
              </label>

              <div class="search-mini">
                <input 
                  type="text" 
                  [(ngModel)]="searchFilter" 
                  placeholder="Фильтр по названию или коду..." 
                  class="search-mini-input" />
              </div>
            </div>

            <div class="toolbar-stats">
              <span class="stat-pill text-emerald">Совпадение 90%+: <strong>{{ highConfidenceCount }}</strong></span>
              <span class="stat-pill text-cyan">Сырьё B2B: <strong>{{ rawCount }}</strong></span>
              <span class="stat-pill text-gold">Бар & Меню: <strong>{{ finishedCount }}</strong></span>
            </div>
          </div>

          <!-- PARSED & CLASSIFIED ITEMS TABLE -->
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align:center;">Применить</th>
                  <th>Позиция в PDF-файле</th>
                  <th>Раздел в PDF</th>
                  <th style="text-align:right;">Цена в PDF</th>
                  <th>🎯 Сопоставленный товар системы</th>
                  <th style="text-align:center;">Точность</th>
                  <th style="text-align:right;">Текущая цена</th>
                  <th style="text-align:center;">Разница (Δ)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of displayedItems" [class.row-unselected]="!item.selected">
                  <td style="text-align:center;">
                    <input type="checkbox" [(ngModel)]="item.selected" />
                  </td>

                  <td>
                    <strong>{{ item.item_name }}</strong>
                    <div class="portion-badge" *ngIf="item.portion">{{ item.portion }}</div>
                  </td>

                  <td>
                    <span class="category-tag">{{ item.pdf_category }}</span>
                  </td>

                  <td class="font-mono text-cyan" style="text-align:right; font-weight:700; font-size:0.85rem;">
                    {{ svc.formatMoney(item.extracted_price_kzt) }}
                  </td>

                  <!-- TARGET SYSTEM MAPPING (SELECTABLE) -->
                  <td>
                    <select 
                      [(ngModel)]="item.target_code" 
                      (ngModelChange)="onTargetCodeChange(item, $event)"
                      class="target-select">
                      <option value="">-- Без привязки --</option>
                      <optgroup label="🍺 Барная карта и кухня (HoReCa)">
                        <option *ngFor="let fp of svc.finishedProducts()" [value]="fp.code">
                          [{{ fp.code }}] {{ fp.name }} ({{ fp.portion_size }})
                        </option>
                      </optgroup>
                      <optgroup label="🌾 Сырьё и ингредиенты (B2B)">
                        <option *ngFor="let rm of svc.rawMaterials()" [value]="rm.code">
                          [{{ rm.code }}] {{ rm.name }} ({{ rm.unit }})
                        </option>
                      </optgroup>
                    </select>
                    <div class="matched-type-hint text-muted" style="font-size:0.68rem; margin-top:2px;">
                      {{ item.target_type === 'FINISHED_PRODUCT' ? '🍺 Готовая продукция / Бар' : (item.target_type === 'RAW_MATERIAL' ? '🥩 Сырье B2B' : '⚠️ Требуется привязка') }}
                    </div>
                  </td>

                  <!-- MATCH CONFIDENCE -->
                  <td style="text-align:center;">
                    <span class="confidence-badge" [ngClass]="getConfidenceBadgeClass(item.match_confidence)">
                      {{ item.match_confidence }}%
                    </span>
                  </td>

                  <!-- CURRENT SYSTEM PRICE -->
                  <td class="font-mono text-muted" style="text-align:right; font-size:0.8rem;">
                    {{ item.current_system_price ? svc.formatMoney(item.current_system_price) : '—' }}
                  </td>

                  <!-- DELTA -->
                  <td style="text-align:center;">
                    <span class="delta-pill" [ngClass]="getDeltaPillClass(item.delta_kzt || 0)">
                      {{ getDeltaLabel(item) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- MODAL ACTIONS -->
          <div class="modal-footer">
            <div class="footer-summary">
              Выбрано позиций для обновления: <strong>{{ selectedCount }}</strong> из <strong>{{ parseResult.items.length }}</strong>
            </div>
            <div class="footer-buttons">
              <button class="btn btn-outline" (click)="svc.closePdfParserModal()">Отмена</button>
              <button 
                class="btn btn-emerald apply-btn" 
                (click)="onApplySelected()" 
                [disabled]="selectedCount === 0 || isApplying">
                <span *ngIf="!isApplying">🚀 Применить выбранные котировки ({{ selectedCount }})</span>
                <span *ngIf="isApplying">⏳ Запись котировок в систему...</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="!parseResult && !isParsing" class="empty-state">
          <div class="empty-icon">🌐 📄 🤖</div>
          <h4>Укажите ссылку на PDF меню или выберите один из быстрых пресетов</h4>
          <p>Движок автоматически подключится к удаленному веб-серверу, извлечет структурированные данные и выполнит классификацию позиций по каталогу холдинга.</p>
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
      z-index: 1000;
    }
    .modal-box-large {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      width: 1360px;
      max-width: 96%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 24px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.8);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-icon {
      font-size: 1.8rem;
    }
    .modal-header h3 { font-size: 1.2rem; color: #fff; margin: 0 0 4px 0; font-weight: 700; }
    .modal-header p { font-size: 0.76rem; color: var(--text-secondary); margin: 0; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .close-btn:hover { color: #fff; }

    .parser-controls {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .url-input-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }
    .input-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .venue-wrap {
      max-width: 320px;
    }
    .input-wrap label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .form-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 8px 12px;
      color: #fff;
      font-size: 0.82rem;
      outline: none;
    }
    .form-input:focus { border-color: var(--accent-cyan); }
    .parse-btn {
      white-space: nowrap;
      height: 38px;
      padding: 0 18px;
      font-weight: 700;
      font-size: 0.82rem;
    }

    .presets-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 8px;
    }
    .preset-label {
      font-size: 0.72rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .preset-chip {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.12);
      color: #e2e8f0;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .preset-chip:hover {
      background: var(--accent-cyan-soft);
      border-color: var(--accent-cyan);
      color: #fff;
    }

    .loader-box {
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(0, 180, 216, 0.08);
      border: 1px solid rgba(0, 180, 216, 0.3);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .loader-spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(0, 180, 216, 0.2);
      border-top-color: var(--accent-cyan);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loader-text strong { display: block; font-size: 0.85rem; color: #fff; margin-bottom: 2px; }
    .loader-text p { font-size: 0.74rem; color: var(--text-secondary); margin: 0; }

    .doc-meta-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 10px 16px;
      margin-bottom: 12px;
      gap: 12px;
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 10px;
      flex-wrap: wrap;
    }
    .filter-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .select-all-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: #fff;
      cursor: pointer;
    }
    .search-mini-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 4px 8px;
      color: #fff;
      font-size: 0.74rem;
      width: 200px;
    }
    .toolbar-stats {
      display: flex;
      gap: 8px;
    }
    .stat-pill {
      font-size: 0.72rem;
      background: rgba(255,255,255,0.04);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .table-scroll {
      overflow-y: auto;
      max-height: 48vh;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
    th {
      background: var(--bg-surface);
      color: var(--text-muted);
      font-size: 0.7rem;
      text-transform: uppercase;
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-strong);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .row-unselected {
      opacity: 0.45;
    }
    .portion-badge {
      display: inline-block;
      font-size: 0.68rem;
      background: rgba(255,255,255,0.05);
      padding: 1px 4px;
      border-radius: 3px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .category-tag {
      font-size: 0.68rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
    }
    .target-select {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 4px 6px;
      color: #fff;
      font-size: 0.75rem;
      width: 100%;
      max-width: 280px;
    }
    .confidence-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .conf-high { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
    .conf-mid { background: rgba(241, 196, 15, 0.15); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
    .conf-low { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3); }

    .delta-pill {
      font-family: monospace;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .delta-up { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .delta-down { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .delta-zero { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

    .modal-footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border-subtle);
      padding-top: 12px;
    }
    .footer-summary { font-size: 0.78rem; color: var(--text-secondary); }
    .footer-buttons { display: flex; gap: 10px; }
    .alert-success {
      background: rgba(46, 204, 113, 0.15);
      border: 1px solid rgba(46, 204, 113, 0.4);
      color: #2ecc71;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      margin-bottom: 12px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-secondary);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .empty-state h4 { color: #fff; font-size: 1rem; margin-bottom: 6px; }
    .empty-state p { font-size: 0.78rem; max-width: 500px; margin: 0 auto; }
    .text-gold { color: #f1c40f !important; }
    .text-cyan { color: var(--accent-cyan) !important; }
    .text-emerald { color: #2ecc71 !important; }
  `]
})
export class PdfMenuParserModalComponent {
  svc = inject(MarketMonitorService);

  pdfUrl: string = 'https://linebrew.kz/downloads/bar_menu_almaty_2026.pdf';
  customVenue: string = 'Line Brew Bar & Grill';
  isParsing: boolean = false;
  isApplying: boolean = false;
  parseResult: PdfRemoteParseResult | null = null;
  searchFilter: string = '';
  notificationMsg: string | null = null;

  selectPreset(url: string, venue: string) {
    this.pdfUrl = url;
    this.customVenue = venue;
    this.onParsePdf();
  }

  async onParsePdf() {
    if (!this.pdfUrl.trim()) return;
    this.isParsing = true;
    this.notificationMsg = null;
    this.parseResult = null;

    try {
      this.parseResult = await this.svc.parseRemotePdfMenu(this.pdfUrl, this.customVenue);
    } catch (e: any) {
      alert('Ошибка при парсинге удаленного PDF: ' + (e?.message || e));
    } finally {
      this.isParsing = false;
    }
  }

  get displayedItems(): PdfMenuParsedItem[] {
    if (!this.parseResult) return [];
    const q = this.searchFilter.toLowerCase().trim();
    if (!q) return this.parseResult.items;

    return this.parseResult.items.filter(i => 
      i.item_name.toLowerCase().includes(q) ||
      i.target_code.toLowerCase().includes(q) ||
      i.target_name.toLowerCase().includes(q) ||
      i.pdf_category.toLowerCase().includes(q)
    );
  }

  get selectedCount(): number {
    return this.parseResult?.items.filter(i => i.selected).length || 0;
  }

  get isAllSelected(): boolean {
    return !!this.parseResult && this.parseResult.items.every(i => i.selected);
  }

  toggleSelectAll() {
    if (!this.parseResult) return;
    const nextState = !this.isAllSelected;
    this.parseResult.items.forEach(i => i.selected = nextState);
  }

  get highConfidenceCount(): number {
    return this.parseResult?.items.filter(i => i.match_confidence >= 90).length || 0;
  }

  get rawCount(): number {
    return this.parseResult?.items.filter(i => i.target_type === 'RAW_MATERIAL').length || 0;
  }

  get finishedCount(): number {
    return this.parseResult?.items.filter(i => i.target_type === 'FINISHED_PRODUCT').length || 0;
  }

  calcClassificationRate(): number {
    if (!this.parseResult || this.parseResult.total_items_found === 0) return 0;
    return Math.round((this.parseResult.classified_items_count / this.parseResult.total_items_found) * 100);
  }

  onTargetCodeChange(item: PdfMenuParsedItem, newCode: string) {
    item.target_code = newCode;
    const fp = this.svc.finishedProducts().find(f => f.code === newCode);
    if (fp) {
      item.target_name = fp.name;
      item.target_type = 'FINISHED_PRODUCT';
      item.current_system_price = fp.competitor_price_kzt || fp.target_beermood_price_kzt;
      item.match_confidence = 100;
    } else {
      const rm = this.svc.rawMaterials().find(r => r.code === newCode);
      if (rm) {
        item.target_name = rm.name;
        item.target_type = 'RAW_MATERIAL';
        item.current_system_price = rm.current_cost_kzt;
        item.match_confidence = 100;
      } else {
        item.target_type = 'UNMAPPED';
        item.match_confidence = 0;
      }
    }

    if (item.current_system_price) {
      item.delta_kzt = item.extracted_price_kzt - item.current_system_price;
      item.delta_pct = Number((((item.extracted_price_kzt - item.current_system_price) / item.current_system_price) * 100).toFixed(1));
    }
  }

  getConfidenceBadgeClass(conf: number): string {
    if (conf >= 90) return 'conf-high';
    if (conf >= 75) return 'conf-mid';
    return 'conf-low';
  }

  getDeltaPillClass(delta: number): string {
    if (delta > 0) return 'delta-up';
    if (delta < 0) return 'delta-down';
    return 'delta-zero';
  }

  getDeltaLabel(item: PdfMenuParsedItem): string {
    if (!item.current_system_price) return '— Новая';
    const delta = item.delta_kzt || 0;
    const pct = item.delta_pct || 0;
    if (delta > 0) return `▲ +${delta.toLocaleString('ru-RU')} ₸ (+${pct}%)`;
    if (delta < 0) return `▼ ${delta.toLocaleString('ru-RU')} ₸ (${pct}%)`;
    return '— 0 ₸ (0.0%)';
  }

  async onApplySelected() {
    if (!this.parseResult) return;
    this.isApplying = true;
    try {
      const appliedCount = await this.svc.applyPdfParsedItems(this.parseResult, this.parseResult.items);
      this.notificationMsg = `✔ Успешно обновлено и зафиксировано котировок: ${appliedCount} поз. Источник «${this.parseResult.venue_name}» поставлен на авто-мониторинг!`;
      setTimeout(() => {
        this.notificationMsg = null;
        this.svc.closePdfParserModal();
      }, 3500);
    } catch (e: any) {
      alert('Ошибка при применении котировок: ' + (e?.message || e));
    } finally {
      this.isApplying = false;
    }
  }
}
