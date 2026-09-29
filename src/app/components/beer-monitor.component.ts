import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { FinishedProductItem } from '../models/market-monitor.model';

@Component({
  selector: 'app-beer-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="beer-monitor-wrap">
      <!-- Top Context Banner -->
      <div class="beer-header-card">
        <div class="header-left">
          <div class="beer-badge">🍺 ЯДРО ВЫРУЧКИ БАРА</div>
          <h2>Мониторинг пивной карты и разливного крафта (BEERMOOD.PUB)</h2>
          <p>
            Алматы, ул. Жарокова 137/1 (ЖК «Арай», блок Г3) • Глубокий бенчмаркинг розлива, себестоимости пролива (COGS бокала) и ценовых коридоров баров-конкурентов
          </p>
        </div>
        <div class="header-right">
          <button class="btn btn-cyan" (click)="onCrawlBeer()">
            🔄 Автопарсинг цен пива
          </button>
          <button class="btn btn-primary" (click)="onAddBeer()">
            ➕ Добавить сорт в меню
          </button>
        </div>
      </div>

      <!-- Beer KPI Strip -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Сортов в пивной матрице</div>
          <div class="kpi-value font-mono text-cyan">
            {{ svc.beerKpiSummary().total }} <span class="kpi-unit">позиций</span>
          </div>
          <div class="kpi-sub">Крафт, эли, стауты, сауры, сидры и кеги</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Ср. цена бокала по Алматы</div>
          <div class="kpi-value font-mono text-gold">
            {{ svc.formatMoney(svc.beerKpiSummary().avgCompetitorPrice) }}
          </div>
          <div class="kpi-sub">Срез: Harat's, Chechil, Dublin, Line Brew, Hophead, Baza</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Ср. цена бокала BeerMood</div>
          <div class="kpi-value font-mono text-emerald">
            {{ svc.formatMoney(svc.beerKpiSummary().avgBeermoodPrice) }}
          </div>
          <div class="kpi-sub">
            Выгода гостя: <strong class="text-emerald">-{{ svc.beerKpiSummary().avgAdvantagePct }}%</strong> от рынка
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Ср. маржинальность пролива</div>
          <div class="kpi-value font-mono text-emerald">
            {{ svc.beerKpiSummary().avgMarginPct }}%
          </div>
          <div class="kpi-sub">
            Наценка бара: <strong>x3.8</strong> к себестоимости (COGS)
          </div>
        </div>
      </div>

      <!-- Margin Spread Benchmark Visualizer -->
      <div class="card benchmark-card">
        <div class="bench-hdr">
          <div>
            <h3>📊 Сравнительный бенчмарк пивной карты: BEERMOOD vs Бары Алматы vs Себестоимость</h3>
            <p>Наглядный спред маржинальности по ключевым крафтовым и разливным стилям</p>
          </div>
          <div class="bench-legend">
            <span class="leg-item"><span class="leg-dot dot-cogs"></span> COGS (Себестоимость пролива)</span>
            <span class="leg-item"><span class="leg-dot dot-beermood"></span> Цена BEERMOOD</span>
            <span class="leg-item"><span class="leg-dot dot-competitor"></span> Рынок Алматы (Ср. цена)</span>
          </div>
        </div>

        <div class="bars-container">
          <div class="beer-bar-row" *ngFor="let item of previewBeerItems">
            <div class="bar-info">
              <span class="bar-title"><strong>{{ item.name }}</strong></span>
              <span class="bar-style-tag">{{ item.beer_style || 'Крафт' }} • {{ item.portion_size }}</span>
            </div>

            <div class="bar-track">
              <!-- COGS fill -->
              <div class="segment seg-cogs" [style.width.%]="(item.estimated_cogs_kzt / 3500) * 100" [title]="'Себестоимость: ' + svc.formatMoney(item.estimated_cogs_kzt)"></div>
              <!-- BeerMood Price marker -->
              <div class="marker mark-bm" [style.left.%]="(item.target_beermood_price_kzt / 3500) * 100" [title]="'BEERMOOD: ' + svc.formatMoney(item.target_beermood_price_kzt)">
                <span>{{ svc.formatMoney(item.target_beermood_price_kzt) }}</span>
              </div>
              <!-- Competitor Price marker -->
              <div class="marker mark-comp" [style.left.%]="(item.competitor_price_kzt / 3500) * 100" [title]="item.competitor_name + ': ' + svc.formatMoney(item.competitor_price_kzt)">
                <span>{{ svc.formatMoney(item.competitor_price_kzt) }}</span>
              </div>
            </div>

            <div class="bar-margin-badge">
              <span class="badge badge-emerald">Маржа {{ item.margin_pct }}%</span>
              <span class="advantage-pill">-{{ item.price_advantage_pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Beer Matrix Filters -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="style-pills">
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'ALL'" 
              (click)="selectedStyle = 'ALL'">
              Все стили ({{ svc.beerItems().length }})
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'IPA / West Coast'" 
              (click)="selectedStyle = 'IPA / West Coast'">
              IPA / APA
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'NEIPA / Hazy'" 
              (click)="selectedStyle = 'NEIPA / Hazy'">
              NEIPA / Hazy
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Pilsner / Lager'" 
              (click)="selectedStyle = 'Pilsner / Lager'">
              Лагеры / Пильзнеры
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Stout / Porter'" 
              (click)="selectedStyle = 'Stout / Porter'">
              Стауты / Портеры
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Sour / Gose'" 
              (click)="selectedStyle = 'Sour / Gose'">
              Сауры / Гозе
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Wheat / Blanche'" 
              (click)="selectedStyle = 'Wheat / Blanche'">
              Пшеничное / Blanche
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Cider'" 
              (click)="selectedStyle = 'Cider'">
              Сидры
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Growler / Takeaway'" 
              (click)="selectedStyle = 'Growler / Takeaway'">
              Навынос 1.0л
            </button>
            <button 
              class="pill-btn" 
              [class.active]="selectedStyle === 'Keg / B2B'" 
              (click)="selectedStyle = 'Keg / B2B'">
              Кеги 30л B2B
            </button>
          </div>

          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Поиск по сорту пива, хмелю или бару..."
              class="search-input" />
          </div>
        </div>
      </div>

      <!-- Beer Matrix Table -->
      <div class="card table-card">
        <div class="table-header-flex">
          <div>
            <h3>🍺 Пивная матрица: Цены, себестоимость пролива и конкурентный срез</h3>
            <p>Ежедневный бенчмаркинг по барам Алматы с расчетом чистой маржи пролива</p>
          </div>
          <span class="text-muted font-mono" style="font-size:0.75rem;">
            Показано: <strong>{{ filteredBeers.length }}</strong> сортов
          </span>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Сорт / Стиль / Профиль</th>
                <th>Подача / Объём</th>
                <th style="text-align:right;">Себест. (COGS)</th>
                <th style="text-align:right;">Цена BEERMOOD</th>
                <th style="text-align:center;">Маржа бара</th>
                <th style="text-align:right;">Цена конкурента</th>
                <th>Бар / Первоисточник</th>
                <th style="text-align:center;">Выгода гостя</th>
                <th style="text-align:center;">Статус</th>
                <th style="text-align:center;">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredBeers">
                <td>
                  <div class="beer-name-box">
                    <span class="beer-icon">🍺</span>
                    <div>
                      <strong>{{ item.name }}</strong>
                      <div class="code-sub">
                        <span class="style-tag-sm">{{ item.beer_style || 'Крафт' }}</span>
                        <code>{{ item.code }}</code>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="font-mono text-gold" style="font-size:0.8rem; font-weight:600;">
                  {{ item.portion_size }}
                </td>
                <td class="font-mono text-muted" style="text-align:right; font-size:0.82rem;">
                  {{ svc.formatMoney(item.estimated_cogs_kzt) }}
                </td>
                <td class="font-mono text-emerald" style="text-align:right; font-weight:700; font-size:0.95rem;">
                  {{ svc.formatMoney(item.target_beermood_price_kzt) }}
                </td>
                <td style="text-align:center;">
                  <span class="badge badge-emerald font-mono font-bold">
                    {{ item.margin_pct }}%
                  </span>
                </td>
                <td class="font-mono" style="text-align:right; font-weight:700; color: #fff;">
                  {{ svc.formatMoney(item.competitor_price_kzt) }}
                </td>
                <td>
                  <div class="source-venue-box">
                    <span class="text-gold" style="font-size:0.8rem; font-weight:600;">{{ item.competitor_name }}</span>
                    <a [href]="item.source_url || svc.findUrlByCode(item.code)" target="_blank" rel="noopener noreferrer" class="source-link" title="Открыть меню бара в 2GIS / Wolt / Онлайн">
                      🔗 {{ item.source_name || 'Онлайн-меню' }} ↗
                    </a>
                  </div>
                </td>
                <td style="text-align:center;">
                  <span class="advantage-badge">
                    -{{ item.price_advantage_pct }}%
                  </span>
                </td>
                <td style="text-align:center;">
                  <span class="badge" [ngClass]="item.fetch_method === 'AUTO_CRAWL' ? 'badge-cyan' : 'badge-manual'">
                    {{ item.fetch_method === 'AUTO_CRAWL' ? '🤖 АВТО' : '📝 ВРУЧНУЮ' }}
                  </span>
                </td>
                <td style="text-align:center;">
                  <div class="action-btn-group">
                    <button class="btn-action-icon" (click)="svc.openLogsModal(item.code)" title="Посмотреть историю аудита цен">
                      📜
                    </button>
                    <button class="btn-action-icon" (click)="svc.openFinishedEntryModal(item)" title="Актуализировать цену или себестоимость">
                      ✏️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .beer-monitor-wrap { display: flex; flex-direction: column; gap: 20px; }
    
    .beer-header-card {
      background: linear-gradient(135deg, rgba(230, 126, 34, 0.12), rgba(26, 22, 19, 0.95));
      border: 1px solid rgba(230, 126, 34, 0.35);
      border-radius: 8px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .beer-badge {
      display: inline-block;
      background: var(--accent-amber);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .header-left h2 { font-size: 1.35rem; color: #fff; font-weight: 700; margin-bottom: 4px; }
    .header-left p { font-size: 0.8rem; color: var(--text-secondary); max-width: 780px; }
    .header-right { display: flex; gap: 10px; }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 16px;
    }
    .kpi-label { font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
    .kpi-value { font-size: 1.55rem; font-weight: 700; margin-bottom: 4px; }
    .kpi-unit { font-size: 0.8rem; font-weight: 400; color: var(--text-muted); }
    .kpi-sub { font-size: 0.72rem; color: var(--text-secondary); }

    /* Benchmark Visualizer */
    .benchmark-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 20px;
    }
    .bench-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
    }
    .bench-hdr h3 { font-size: 1.05rem; color: #fff; margin-bottom: 2px; }
    .bench-hdr p { font-size: 0.74rem; color: var(--text-secondary); }
    .bench-legend { display: flex; gap: 14px; font-size: 0.72rem; color: var(--text-secondary); }
    .leg-item { display: flex; align-items: center; gap: 6px; }
    .leg-dot { width: 10px; height: 10px; border-radius: 2px; }
    .dot-cogs { background: #64748b; }
    .dot-beermood { background: var(--accent-emerald); }
    .dot-competitor { background: #f39c12; }

    .bars-container { display: flex; flex-direction: column; gap: 12px; }
    .beer-bar-row {
      display: grid;
      grid-template-columns: 240px 1fr 140px;
      align-items: center;
      gap: 16px;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .bar-info { display: flex; flex-direction: column; gap: 2px; }
    .bar-title { font-size: 0.82rem; color: #fff; }
    .bar-style-tag { font-size: 0.7rem; color: var(--text-muted); }

    .bar-track {
      position: relative;
      height: 22px;
      background: rgba(255,255,255,0.04);
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
    }
    .segment.seg-cogs {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      background: rgba(148, 163, 184, 0.35);
      border-radius: 3px 0 0 3px;
    }
    .marker {
      position: absolute;
      top: -2px; bottom: -2px;
      width: 2px;
      transform: translateX(-50%);
    }
    .marker span {
      position: absolute;
      bottom: 24px;
      transform: translateX(-50%);
      font-size: 0.68rem;
      font-family: var(--font-mono);
      font-weight: 700;
      white-space: nowrap;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .mark-bm { background: var(--accent-emerald); z-index: 2; }
    .mark-bm span { background: rgba(39, 174, 96, 0.25); color: var(--accent-emerald); border: 1px solid var(--accent-emerald); }
    .mark-comp { background: #f39c12; z-index: 1; }
    .mark-comp span { background: rgba(243, 156, 18, 0.25); color: #f39c12; border: 1px solid #f39c12; }

    .bar-margin-badge { display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
    .advantage-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-emerald);
      background: rgba(39, 174, 96, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Filters */
    .filters-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 12px 16px;
    }
    .filters-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .style-pills { display: flex; flex-wrap: wrap; gap: 6px; }
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
    .search-box { flex: 1; max-width: 320px; }
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

    /* Table */
    .table-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 20px;
    }
    .table-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .table-header-flex h3 { font-size: 1.05rem; color: #fff; }
    .table-header-flex p { font-size: 0.74rem; color: var(--text-secondary); }

    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th {
      background: var(--bg-surface-elevated);
      color: var(--text-muted);
      font-size: 0.72rem;
      text-transform: uppercase;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-strong);
      white-space: nowrap;
    }
    td { padding: 10px 12px; border-bottom: 1px solid var(--border-subtle); }
    .beer-name-box { display: flex; align-items: center; gap: 10px; }
    .beer-icon { font-size: 1.25rem; }
    .code-sub { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
    .style-tag-sm {
      background: rgba(230, 126, 34, 0.15);
      color: #f39c12;
      border-radius: 3px;
      padding: 1px 5px;
      font-size: 0.68rem;
      font-weight: 600;
    }
    .code-sub code { background: rgba(255, 255, 255, 0.04); padding: 1px 4px; border-radius: 3px; color: var(--text-muted); font-size: 0.68rem; }
    .source-venue-box { display: flex; flex-direction: column; gap: 3px; }
    .source-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.72rem;
      background: var(--accent-cyan-soft);
      padding: 1px 5px;
      border-radius: 3px;
      width: fit-content;
    }
    .source-link:hover { text-decoration: underline; }
    .advantage-badge {
      background: rgba(39, 174, 96, 0.15);
      border: 1px solid rgba(39, 174, 96, 0.35);
      color: var(--accent-emerald);
      font-weight: 700;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .action-btn-group { display: flex; gap: 6px; justify-content: center; }
    .btn-action-icon {
      background: transparent;
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 3px 6px;
      transition: all 0.2s;
    }
    .btn-action-icon:hover {
      background: rgba(255,255,255,0.08);
      border-color: #fff;
    }
  `]
})
export class BeerMonitorComponent {
  svc = inject(MarketMonitorService);

  selectedStyle: string = 'ALL';
  searchQuery: string = '';

  get previewBeerItems(): FinishedProductItem[] {
    return this.svc.beerItems().filter(i => !i.unit.includes('кег')).slice(0, 6);
  }

  get filteredBeers(): FinishedProductItem[] {
    const style = this.selectedStyle;
    const q = this.searchQuery.toLowerCase().trim();

    return this.svc.beerItems().filter(item => {
      const matchStyle = (style === 'ALL' || item.beer_style === style || (item.portion_size && item.portion_size.includes(style)));
      const matchQuery = !q || 
        item.name.toLowerCase().includes(q) || 
        item.code.toLowerCase().includes(q) ||
        item.competitor_name.toLowerCase().includes(q) ||
        (item.beer_style && item.beer_style.toLowerCase().includes(q));

      return matchStyle && matchQuery;
    });
  }

  onCrawlBeer() {
    this.svc.triggerBeerCrawl();
  }

  onAddBeer() {
    this.svc.openFinishedEntryModal();
  }
}
