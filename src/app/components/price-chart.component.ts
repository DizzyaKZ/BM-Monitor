import { Component, ElementRef, ViewChild, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketMonitorService } from '../services/market-monitor.service';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="chart-panel">
      <div class="chart-header">
        <div class="chart-title">
          <h2 *ngIf="svc.activeMaterial() as m">
            📈 {{ m.name }} ({{ m.unit }}) — Динамика в Алматы
            <span *ngIf="m.fetch_method === 'AUTO_CRAWL'" class="badge-auto-chart">🤖 Авто-сбор</span>
            <span *ngIf="m.fetch_method === 'MANUAL_ENTRY'" class="badge-manual-chart">📝 Ручной ввод (оффлайн)</span>
          </h2>
          <p *ngIf="svc.activeMaterial() as m">
            Текущий коридор: {{ svc.formatMoney(m.market_min_kzt) }} ... {{ svc.formatMoney(m.market_max_kzt) }} • Средняя: {{ svc.formatMoney(m.market_avg_kzt) }}
          </p>
        </div>
        <div class="chart-controls">
          <label>Сырье:</label>
          <select [ngModel]="svc.selectedCode()" (ngModelChange)="onCodeChange($event)">
            <option *ngFor="let it of svc.rawMaterials()" [value]="it.code">
              [{{ it.category }}] {{ it.name }}
            </option>
          </select>
          <label style="margin-left:8px;">Период:</label>
          <select [ngModel]="svc.selectedDays()" (ngModelChange)="onDaysChange($event)">
            <option [value]="7">7 дней</option>
            <option [value]="14">14 дней</option>
            <option [value]="30">30 дней</option>
          </select>
          <button class="btn btn-outline" style="padding:6px 10px; font-size:0.78rem; margin-left:8px;" (click)="svc.openLogsModal(svc.selectedCode())">
            📜 Логи позиции
          </button>
        </div>
      </div>

      <div class="chart-canvas-box">
        <canvas #canvasRef></canvas>
      </div>

      <div class="sources-legend">
        <span class="source-chip"><span class="source-dot" style="background:#e57c23;"></span> Средневзвешенная цена (KZT)</span>
        <span class="source-chip"><span class="source-dot" style="background:#27ae60;"></span> Рынок «Алтын Орда» (Опт)</span>
        <span class="source-chip"><span class="source-dot" style="background:#00b4d8;"></span> METRO Cash & Carry</span>
        <span class="source-chip"><span class="source-dot" style="background:#f39c12;"></span> «Зеленый Базар»</span>
        <span class="source-chip"><span class="source-dot" style="background:#9b59b6;"></span> Прямой поставщик</span>
      </div>
    </section>
  `,
  styles: [`
    .chart-panel {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 22px;
      margin-bottom: 24px;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 18px;
    }
    .chart-title h2 { font-size: 1.15rem; font-weight: 700; color: #fff; }
    .chart-title p { font-size: 0.78rem; color: var(--text-secondary); }
    .chart-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .chart-controls label { font-size: 0.78rem; color: var(--text-secondary); }
    .chart-canvas-box {
      width: 100%;
      height: 330px;
      position: relative;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 10px;
    }
    canvas { width: 100% !important; height: 100% !important; display: block; }
    .sources-legend {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
      font-size: 0.75rem;
    }
    .source-chip {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 4px;
      padding: 3px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
    }
    .source-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  
    .badge-auto-chart {
      background: rgba(39, 174, 96, 0.2);
      color: #2ecc71;
      border: 1px solid rgba(39, 174, 96, 0.4);
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .badge-manual-chart {
      background: rgba(148, 163, 184, 0.15);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 8px;
      vertical-align: middle;
    }
    .manual-chart-notice {
      background: rgba(148, 163, 184, 0.08);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 0.76rem;
      color: #94a3b8;
      margin-bottom: 14px;
      line-height: 1.4;
    }
    .manual-chart-notice strong {
      color: #cbd5e1;
    }
`]
})
export class PriceChartComponent implements AfterViewInit {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  svc = inject(MarketMonitorService);

  constructor() {
    effect(() => {
      // Re-draw when history changes
      const hist = this.svc.historyData();
      if (this.canvasRef) {
        this.renderCanvas();
      }
    });
  }

  ngAfterViewInit() {
    this.renderCanvas();
    window.addEventListener('resize', () => this.renderCanvas());
  }

  onCodeChange(val: string) {
    this.svc.loadHistory(val, this.svc.selectedDays());
  }

  onDaysChange(val: any) {
    this.svc.loadHistory(this.svc.selectedCode(), parseInt(val, 10));
  }

  renderCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const history = this.svc.historyData();
    if (!history || history.length === 0) {
      ctx.fillStyle = '#6e6760';
      ctx.font = '14px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText('Загрузка котировок...', w / 2, h / 2);
      return;
    }

    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;
    const plotW = w - paddingLeft - paddingRight;
    const plotH = h - paddingTop - paddingBottom;

    let minP = Infinity;
    let maxP = -Infinity;
    history.forEach(d => {
      if (d.min_price < minP) minP = d.min_price;
      if (d.max_price > maxP) maxP = d.max_price;
    });

    const range = (maxP - minP) || 1;
    minP = Math.floor(minP - range * 0.08);
    maxP = Math.ceil(maxP + range * 0.08);

    // Y Grid
    ctx.strokeStyle = '#2b2723';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6e6760';
    ctx.font = '10px Fira Code';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const yVal = minP + ((maxP - minP) * i) / 5;
      const y = paddingTop + plotH - (i / 5) * plotH;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w - paddingRight, y);
      ctx.stroke();
      ctx.fillText(Math.round(yVal) + ' ₸', paddingLeft - 8, y + 3);
    }

    // X Dates
    ctx.textAlign = 'center';
    const stepX = plotW / (history.length - 1 || 1);
    const skip = Math.ceil(history.length / 8);

    history.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX;
      if (idx % skip === 0 || idx === history.length - 1) {
        const parts = d.date.split('-');
        ctx.fillText(`${parts[2]}.${parts[1]}`, x, h - 12);
      }
    });

    // Min/Max corridor
    ctx.beginPath();
    history.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX;
      const yMax = paddingTop + plotH - ((d.max_price - minP) / (maxP - minP)) * plotH;
      if (idx === 0) ctx.moveTo(x, yMax);
      else ctx.lineTo(x, yMax);
    });
    for (let idx = history.length - 1; idx >= 0; idx--) {
      const d = history[idx];
      const x = paddingLeft + idx * stepX;
      const yMin = paddingTop + plotH - ((d.min_price - minP) / (maxP - minP)) * plotH;
      ctx.lineTo(x, yMin);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 180, 216, 0.08)';
    ctx.fill();

    // Altyn Orda line
    ctx.beginPath();
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    history.forEach((d, idx) => {
      const p = d.sources?.['altyn_orda'] || d.min_price;
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + plotH - ((p - minP) / (maxP - minP)) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Avg Price Line
    ctx.beginPath();
    ctx.strokeStyle = '#e57c23';
    ctx.lineWidth = 2.5;
    history.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + plotH - ((d.avg_price - minP) / (maxP - minP)) * plotH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Avg Points
    history.forEach((d, idx) => {
      const x = paddingLeft + idx * stepX;
      const y = paddingTop + plotH - ((d.avg_price - minP) / (maxP - minP)) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e57c23';
      ctx.fill();
      ctx.strokeStyle = '#181614';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
}
