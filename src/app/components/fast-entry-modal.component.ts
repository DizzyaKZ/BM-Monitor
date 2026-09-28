import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-fast-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="svc.isFastEntryModalOpen()" (click)="svc.closeFastEntryModal()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⚡ Экспресс-ввод утренней цены</h3>
          <button class="close-btn" (click)="svc.closeFastEntryModal()">&times;</button>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Позиция сырья:</label>
            <select [(ngModel)]="form.code" name="code" required>
              <option *ngFor="let it of svc.rawMaterials()" [value]="it.code">
                {{ it.name }} ({{ it.unit }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Источник / Торговая точка в Алматы:</label>
            <select [(ngModel)]="form.source_id" name="source_id" required>
              <option *ngFor="let s of svc.sources()" [value]="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Зафиксированная цена (KZT):</label>
            <input type="number" step="0.1" [(ngModel)]="form.price_kzt" name="price_kzt" required placeholder="Например: 2950">
          </div>

          <div class="form-group">
            <label>Прямая ссылка на источник / витрину (URL):</label>
            <input type="text" [(ngModel)]="form.source_url" name="source_url" placeholder="https://kaspi.kz/... или оставьте пустым">
          </div>

          <div class="form-group">
            <label>Дата котировки:</label>
            <input type="date" [(ngModel)]="form.date" name="date" required>
          </div>

          <div class="form-group">
            <label>Примечание / Номер накладной:</label>
            <input type="text" [(ngModel)]="form.notes" name="notes" placeholder="Например: Опт от 50 кг, точка №14-Б">
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="svc.closeFastEntryModal()">Отмена</button>
            <button type="submit" class="btn btn-primary">Зафиксировать котировку</button>
          </div>
        </form>
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
    .modal-box {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      width: 560px;
      max-width: 94%;
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
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.4rem; cursor: pointer; }
    .form-group { margin-bottom: 14px; }
    .form-group label { display: block; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 5px; }
    .form-group select, .form-group input { width: 100%; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  `]
})
export class FastEntryModalComponent {
  svc = inject(MarketMonitorService);

  form = {
    code: 'MILK-RAW-COW',
    source_id: 'altyn_orda',
    price_kzt: 285,
    source_url: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  async onSubmit() {
    await this.svc.submitFastEntry(this.form);
  }
}
