export class LiveChart {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dataPoints: number[] = [];
  private maxPoints: number = 50;
  private resizeObserver: ResizeObserver;
  private peakValue: number = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.render();
    });
    this.resizeObserver.observe(this.canvas);
    this.resize();
  }

  public setMaxPoints(pts: number) {
    this.maxPoints = Math.max(20, pts);
  }

  public addDataPoint(speedBps: number) {
    const mbps = speedBps / 1000000;
    this.dataPoints.push(mbps);
    if (this.dataPoints.length > this.maxPoints) {
      this.dataPoints.shift();
    }
    if (mbps > this.peakValue) {
      this.peakValue = mbps;
    }
    this.render();
  }

  public clear() {
    this.dataPoints = [];
    this.peakValue = 0;
    this.render();
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  public render() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;

    this.ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    if (this.dataPoints.length < 2) {
      return;
    }

    const maxVal = Math.max(10, Math.ceil(this.peakValue * 1.15));
    const stepX = width / (this.maxPoints - 1);
    const startX = width - (this.dataPoints.length - 1) * stepX;

    // Fill gradient (Geometric Balance accent #60cdff)
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(96, 205, 255, 0.28)');
    gradient.addColorStop(0.7, 'rgba(96, 205, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(96, 205, 255, 0.0)');

    this.ctx.beginPath();
    this.dataPoints.forEach((val, idx) => {
      const x = startX + idx * stepX;
      const y = height - (val / maxVal) * (height - 20) - 10;
      if (idx === 0) {
        this.ctx.moveTo(x, y);
      } else {
        // Smooth curve
        const prevX = startX + (idx - 1) * stepX;
        const prevVal = this.dataPoints[idx - 1];
        const prevY = height - (prevVal / maxVal) * (height - 20) - 10;
        const cx = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(prevX, prevY, cx, (prevY + y) / 2);
      }
    });

    const lastX = startX + (this.dataPoints.length - 1) * stepX;
    this.ctx.lineTo(lastX, height);
    this.ctx.lineTo(startX, height);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Main line stroke
    this.ctx.beginPath();
    this.dataPoints.forEach((val, idx) => {
      const x = startX + idx * stepX;
      const y = height - (val / maxVal) * (height - 20) - 10;
      if (idx === 0) {
        this.ctx.moveTo(x, y);
      } else {
        const prevX = startX + (idx - 1) * stepX;
        const prevVal = this.dataPoints[idx - 1];
        const prevY = height - (prevVal / maxVal) * (height - 20) - 10;
        const cx = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(prevX, prevY, cx, (prevY + y) / 2);
      }
    });
    this.ctx.strokeStyle = '#60cdff';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Current point highlight
    const currentVal = this.dataPoints[this.dataPoints.length - 1];
    const currentY = height - (currentVal / maxVal) * (height - 20) - 10;
    this.ctx.beginPath();
    this.ctx.arc(lastX, currentY, 4.5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#60cdff';
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
  }

  public destroy() {
    this.resizeObserver.disconnect();
  }
}
