import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';
import { MarketSource, CompetitorVenue, ChannelType } from '../models/market-monitor.model';

@Component({
  selector: 'app-sources-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isSourcesModalOpen()" (click)="svc.closeSourcesModal()">
      <div class="modal-box modal-box-large" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h3>🏢 Реестр источников цен и заведений (г. Алматы)</h3>
            <p>Расширение сравнительной оценочной базы: оптовые хабы, B2B-поставщики, крафтовые бары и витрины</p>
          </div>
          <button class="close-btn" (click)="svc.closeSourcesModal()">&times;</button>
        </div>

        <!-- Controls & Sub-tabs -->
        <div class="modal-controls">
          <div class="tab-pills">
            <button 
              class="pill-btn" 
              [class.active]="activeTab === 'VENUES'" 
              (click)="activeTab = 'VENUES'">
              🍺/🍽️ Бары, рестораны и магазины ({{ svc.competitorVenues().length }})
            </button>
            <button 
              class="pill-btn" 
              [class.active]="activeTab === 'RAW_SOURCES'" 
              (click)="activeTab = 'RAW_SOURCES'">
              📦 Рынки и поставщики сырья ({{ svc.sources().length }})
            </button>
          </div>

          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Поиск источника по названию, адресу..."
              class="search-input" />
          </div>

          <button class="btn btn-emerald" (click)="isAddingFormOpen = !isAddingFormOpen">
            {{ isAddingFormOpen ? '✕ Скрыть форму' : '➕ Добавить источник' }}
          </button>
        </div>

        <!-- Inline Add Source Form -->
        <div class="add-source-card" *ngIf="isAddingFormOpen">
          <div class="form-title">
            <strong>➕ Добавление нового источника цен</strong>
            <span class="text-muted"> (будет сохранен в базе данных и сразу доступен для мониторинга)</span>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Категория базы:</label>
              <select [(ngModel)]="newCategoryType" class="form-input">
                <option value="COMPETITOR">🍺/🍽️ Заведение конкурента (Бар, паб, ресторан, витрина)</option>
                <option value="SUPPLIER">📦 Поставщик сырья (Рынок, оптовый склад, B2B дистрибьютор)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Название источника / заведения: *</label>
              <input type="text" [(ngModel)]="newName" placeholder="Например: Craft Embassy / ТОО АгроФерма" class="form-input" />
            </div>

            <div class="form-group" *ngIf="newCategoryType === 'COMPETITOR'">
              <label>Тип канала HoReCa:</label>
              <select [(ngModel)]="newChannelType" class="form-input">
                <option value="BAR_PUB">Бар / Паб / Ресторан</option>
                <option value="CRAFT_SHOP">Крафтовый магазин / Ботлшоп</option>
                <option value="RETAIL_SUPERMARKET">Супермаркет / Ритейл</option>
                <option value="ARTISAN_BOUTIQUE">Крафтовая лавка / Бутик</option>
                <option value="DELIVERY_APP">Служба доставки (Wolt / Choco)</option>
              </select>
            </div>

            <div class="form-group" *ngIf="newCategoryType === 'SUPPLIER'">
              <label>Тип поставщика:</label>
              <select [(ngModel)]="newSourceType" class="form-input">
                <option value="MARKET">Оптовый продовольственный рынок</option>
                <option value="HYPERMARKET">Оптовый гипермаркет (B2B Cash & Carry)</option>
                <option value="SUPPLIER">Официальный дистрибьютор / Производитель</option>
                <option value="ONLINE">Онлайн B2B площадка</option>
              </select>
            </div>

            <div class="form-group">
              <label>Адрес / Локация в Алматы:</label>
              <input type="text" [(ngModel)]="newAddress" placeholder="Например: ул. Достык 120 / мкр. Самал" class="form-input" />
            </div>

            <div class="form-group">
              <label>Ссылка на первоисточник (Сайт, Меню, 2GIS, Каталог):</label>
              <input type="url" [(ngModel)]="newUrl" placeholder="https://..." class="form-input" />
            </div>

            <div class="form-group span-2">
              <label>Описание / Специализация / Примечания:</label>
              <input type="text" [(ngModel)]="newNotes" placeholder="Например: Крафтовая линейка IPA/Stout, сезонные новинки" class="form-input" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-outline" (click)="isAddingFormOpen = false">Отмена</button>
            <button class="btn btn-primary" [disabled]="!newName.trim()" (click)="onSubmitNewSource()">
              ✔ Сохранить источник в базу
            </button>
          </div>
        </div>

        <!-- Modal Body: Tables -->
        <div class="modal-body">
          <!-- 1. COMPETITOR VENUES TABLE -->
          <div *ngIf="activeTab === 'VENUES'">
            <table>
              <thead>
                <tr>
                  <th>Заведение / Бренд</th>
                  <th>Тип канала</th>
                  <th>Адрес в Алматы</th>
                  <th>Платформа / Ссылка</th>
                  <th>Специализация / Примечание</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let v of filteredVenues">
                  <td>
                    <strong>{{ v.name }}</strong>
                    <div class="code-sub"><code>{{ v.id }}</code></div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getChannelBadgeClass(v.channel_type)">
                      {{ getChannelLabel(v.channel_type) }}
                    </span>
                  </td>
                  <td class="text-secondary" style="font-size:0.78rem;">
                    {{ v.address || 'г. Алматы' }}
                  </td>
                  <td>
                    <a *ngIf="v.menu_url" [href]="v.menu_url" target="_blank" rel="noopener noreferrer" class="source-link">
                      🔗 {{ v.platform || 'Открыть витрину' }} ↗
                    </a>
                    <span *ngIf="!v.menu_url" class="text-muted font-mono" style="font-size:0.72rem;">нет URL</span>
                  </td>
                  <td class="text-muted" style="font-size:0.75rem;">
                    {{ v.notes || 'Позиции в мониторинге' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 2. RAW SOURCES TABLE -->
          <div *ngIf="activeTab === 'RAW_SOURCES'">
            <table>
              <thead>
                <tr>
                  <th>Поставщик / Хаб</th>
                  <th>Тип источника</th>
                  <th>Ссылка на каталог / 2GIS</th>
                  <th>Специализация поставок сырья</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of filteredSources">
                  <td>
                    <strong>{{ s.name }}</strong>
                    <div class="code-sub"><code>{{ s.id }}</code></div>
                  </td>
                  <td>
                    <span class="badge badge-amber">
                      {{ s.type }}
                    </span>
                  </td>
                  <td>
                    <a *ngIf="s.base_url" [href]="s.base_url" target="_blank" rel="noopener noreferrer" class="source-link">
                      🔗 {{ getCleanDomain(s.base_url) }} ↗
                    </a>
                    <span *ngIf="!s.base_url" class="text-muted font-mono" style="font-size:0.72rem;">нет URL</span>
                  </td>
                  <td class="text-secondary" style="font-size:0.76rem;">
                    {{ s.description || 'Оптовые закупки сырья для бара' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <span class="text-muted" style="font-size:0.76rem; margin-right:auto;">
            Всего источников в оценочной базе: 
            <strong>{{ svc.competitorVenues().length + svc.sources().length }}</strong>
          </span>
          <button class="btn btn-outline" (click)="svc.closeSourcesModal()">Закрыть реестр</button>
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
      z-index: 1050;
    }
    .modal-box-large {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      width: 1150px;
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
    .tab-pills { display: flex; gap: 6px; }
    .pill-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.76rem;
      font-weight: 600;
      padding: 6px 12px;
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

    /* Add Source Form */
    .add-source-card {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--accent-emerald-soft);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 14px;
      animation: fadeIn 0.2s ease-in-out;
    }
    .form-title { font-size: 0.85rem; color: #fff; margin-bottom: 12px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    .span-2 { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }
    .form-input {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 6px 8px;
      color: #fff;
      font-size: 0.78rem;
      outline: none;
    }
    .form-input:focus { border-color: var(--accent-emerald); }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; }

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
    .btn-emerald { background: var(--accent-emerald); color: #fff; font-weight: 600; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; }
    .btn-emerald:hover { filter: brightness(1.1); }
  `]
})
export class SourcesModalComponent {
  svc = inject(MarketMonitorService);

  activeTab: 'VENUES' | 'RAW_SOURCES' = 'VENUES';
  searchQuery: string = '';
  isAddingFormOpen: boolean = false;

  // New source form bindings
  newCategoryType: 'COMPETITOR' | 'SUPPLIER' = 'COMPETITOR';
  newName: string = '';
  newChannelType: ChannelType = 'BAR_PUB';
  newSourceType: 'MARKET' | 'HYPERMARKET' | 'ONLINE' | 'SUPPLIER' = 'MARKET';
  newAddress: string = '';
  newUrl: string = '';
  newNotes: string = '';

  get filteredVenues(): CompetitorVenue[] {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.svc.competitorVenues();
    if (!q) return list;
    return list.filter(v => 
      v.name.toLowerCase().includes(q) || 
      (v.address && v.address.toLowerCase().includes(q)) ||
      (v.platform && v.platform.toLowerCase().includes(q))
    );
  }

  get filteredSources(): MarketSource[] {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.svc.sources();
    if (!q) return list;
    return list.filter(s => 
      s.name.toLowerCase().includes(q) || 
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  getChannelLabel(channel: ChannelType): string {
    const map: Record<string, string> = {
      'BAR_PUB': 'Бар / Паб',
      'CRAFT_SHOP': 'Крафт-шоп',
      'RETAIL_SUPERMARKET': 'Супермаркет',
      'ARTISAN_BOUTIQUE': 'Крафт-бутик',
      'DELIVERY_APP': 'Доставка'
    };
    return map[channel] || channel;
  }

  getChannelBadgeClass(channel: ChannelType): string {
    if (channel === 'BAR_PUB') return 'badge-amber';
    if (channel === 'CRAFT_SHOP') return 'badge-cyan';
    if (channel === 'ARTISAN_BOUTIQUE') return 'badge-emerald';
    return 'badge-manual';
  }

  getCleanDomain(url: string): string {
    if (!url) return '—';
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url.length > 25 ? url.substring(0, 25) + '...' : url;
    }
  }

  async onSubmitNewSource() {
    if (!this.newName.trim()) return;

    if (this.newCategoryType === 'COMPETITOR') {
      await this.svc.addCompetitorVenue({
        name: this.newName.trim(),
        channel_type: this.newChannelType,
        address: this.newAddress.trim() || 'Алматы',
        menu_url: this.newUrl.trim() || 'https://2gis.kz/almaty',
        platform: '2GIS / Меню',
        notes: this.newNotes.trim() || 'Новый источник цен'
      });
      this.activeTab = 'VENUES';
    } else {
      await this.svc.addSource({
        name: this.newName.trim(),
        type: this.newSourceType,
        base_url: this.newUrl.trim() || 'https://2gis.kz/almaty',
        description: this.newNotes.trim() || 'Оптовый источник сырья'
      });
      this.activeTab = 'RAW_SOURCES';
    }

    // Reset form
    this.newName = '';
    this.newAddress = '';
    this.newUrl = '';
    this.newNotes = '';
    this.isAddingFormOpen = false;
  }
}
