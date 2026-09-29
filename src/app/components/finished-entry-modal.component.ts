import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-finished-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="svc.isFinishedEntryModalOpen()" (click)="onBackdropClick($event)">
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h3>{{ isEditMode ? 'Редактировать котировку меню' : 'Новая позиция готовой продукции' }}</h3>
            <p>Фиксация цен в барах, ресторанах, лавках и супермаркетах Алматы</p>
          </div>
          <button class="btn-close" (click)="svc.closeFinishedEntryModal()">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Позиция в линейке BeerMood / Mood Group</label>
            <select 
              [(ngModel)]="formData.code" 
              (ngModelChange)="onCodeChange($event)"
              class="form-control"
              [disabled]="isEditMode">
              <option *ngFor="let p of svc.finishedProducts()" [value]="p.code">
                [{{ p.code }}] {{ p.name }} ({{ p.portion_size }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Заведение / Конкурент</label>
              <input 
                type="text" 
                [(ngModel)]="formData.competitor_name" 
                placeholder="например, Harat's Irish Pub"
                class="form-control" />
            </div>

            <div class="form-group">
              <label>Цена в меню конкурента (₸)</label>
              <input 
                type="number" 
                [(ngModel)]="formData.competitor_price_kzt" 
                placeholder="2450"
                class="form-control font-mono" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Целевая розничная цена BeerMood (₸)</label>
              <input 
                type="number" 
                [(ngModel)]="formData.target_beermood_price_kzt" 
                placeholder="2100"
                class="form-control font-mono" />
            </div>

            <div class="form-group">
              <label>Название источника</label>
              <input 
                type="text" 
                [(ngModel)]="formData.source_name" 
                placeholder="Wolt Меню / Untappd / Сайт"
                class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label>Ссылка на опубликованное меню / страницу</label>
            <input 
              type="url" 
              [(ngModel)]="formData.source_url" 
              placeholder="https://wolt.com/... или https://untappd.com/... или https://satu.kz/..."
              class="form-control" />
          </div>

          <div class="benchmark-preview" *ngIf="formData.competitor_price_kzt > 0 && formData.target_beermood_price_kzt > 0">
            <div class="preview-item">
              <span>Себестоимость сырья (COGS):</span>
              <strong>{{ currentCogs }} ₸</strong>
            </div>
            <div class="preview-item">
              <span>Расчетная маржа BeerMood:</span>
              <strong class="text-emerald">{{ calcMargin() }}%</strong>
            </div>
            <div class="preview-item">
              <span>Выгода гостя перед конкурентом:</span>
              <strong class="text-gold">{{ calcAdvantage() }}%</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" (click)="svc.closeFinishedEntryModal()">Отмена</button>
          <button class="btn btn-primary" (click)="onSubmit()" [disabled]="!isValid()">
            💾 Сохранить котировку
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-dialog {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      width: 100%;
      max-width: 580px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .modal-header {
      padding: 18px 20px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: var(--bg-surface);
    }
    .modal-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 4px;
    }
    .modal-header p {
      font-size: 0.76rem;
      color: var(--text-secondary);
    }
    .btn-close {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.2rem;
      cursor: pointer;
    }
    .btn-close:hover { color: #fff; }
    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 8px 12px;
      color: #fff;
      font-size: 0.85rem;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--accent-amber);
    }
    .form-control:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .benchmark-preview {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .preview-item {
      display: flex;
      flex-direction: column;
      font-size: 0.74rem;
      color: var(--text-secondary);
      gap: 2px;
    }
    .preview-item strong {
      font-size: 0.95rem;
      font-family: monospace;
      color: #fff;
    }
    .modal-footer {
      padding: 14px 20px;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .font-mono { font-family: monospace; }
    .text-emerald { color: #2ecc71 !important; }
    .text-gold { color: #f1c40f !important; }
  `]
})
export class FinishedEntryModalComponent {
  svc = inject(MarketMonitorService);

  isEditMode = false;
  currentCogs = 0;

  formData = {
    code: '',
    competitor_name: '',
    competitor_price_kzt: 0,
    target_beermood_price_kzt: 0,
    source_name: '',
    source_url: ''
  };

  constructor() {
    effect(() => {
      const item = this.svc.editingFinishedItem();
      if (item) {
        this.isEditMode = true;
        this.currentCogs = item.estimated_cogs_kzt || 0;
        this.formData = {
          code: item.code,
          competitor_name: item.competitor_name,
          competitor_price_kzt: item.competitor_price_kzt,
          target_beermood_price_kzt: item.target_beermood_price_kzt,
          source_name: item.source_name,
          source_url: item.source_url
        };
      } else {
        this.isEditMode = false;
        const first = this.svc.finishedProducts()[0];
        if (first) {
          this.currentCogs = first.estimated_cogs_kzt || 0;
          this.formData = {
            code: first.code,
            competitor_name: first.competitor_name,
            competitor_price_kzt: first.competitor_price_kzt,
            target_beermood_price_kzt: first.target_beermood_price_kzt,
            source_name: first.source_name,
            source_url: first.source_url
          };
        }
      }
    });
  }

  onCodeChange(code: string) {
    const item = this.svc.finishedProducts().find(p => p.code === code);
    if (item) {
      this.currentCogs = item.estimated_cogs_kzt || 0;
      this.formData.competitor_name = item.competitor_name;
      this.formData.competitor_price_kzt = item.competitor_price_kzt;
      this.formData.target_beermood_price_kzt = item.target_beermood_price_kzt;
      this.formData.source_name = item.source_name;
      this.formData.source_url = item.source_url;
    }
  }

  calcMargin(): number {
    const rrp = this.formData.target_beermood_price_kzt;
    if (!rrp) return 0;
    return parseFloat((((rrp - this.currentCogs) / rrp) * 100).toFixed(1));
  }

  calcAdvantage(): number {
    const comp = this.formData.competitor_price_kzt;
    const rrp = this.formData.target_beermood_price_kzt;
    if (!comp) return 0;
    return parseFloat((((comp - rrp) / comp) * 100).toFixed(1));
  }

  isValid(): boolean {
    return !!(this.formData.code && this.formData.competitor_price_kzt > 0);
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.svc.closeFinishedEntryModal();
    }
  }

  async onSubmit() {
    if (!this.isValid()) return;
    await this.svc.submitFinishedEntry(this.formData);
  }
}
