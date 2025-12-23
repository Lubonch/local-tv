import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-progress-bar',
  imports: [CommonModule],
  templateUrl: './video-progress-bar.html',
  styleUrl: './video-progress-bar.css'
})
export class VideoProgressBarComponent {
  @Input() currentTime: number = 0;
  @Input() duration: number = 0;
  @Output() seek = new EventEmitter<number>();

  @ViewChild('progressBar', { static: false }) progressBar!: ElementRef<HTMLDivElement>;

  isDragging: boolean = false;
  previewTime: number = 0;
  showPreview: boolean = false;
  previewPosition: number = 0;

  get progressPercentage(): number {
    if (this.duration === 0) return 0;
    return (this.currentTime / this.duration) * 100;
  }

  get currentTimeFormatted(): string {
    return this.formatTime(this.currentTime);
  }

  get durationFormatted(): string {
    return this.formatTime(this.duration);
  }

  get previewTimeFormatted(): string {
    return this.formatTime(this.previewTime);
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  onProgressBarClick(event: MouseEvent): void {
    this.seekToPosition(event);
  }

  onProgressBarMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.seekToPosition(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.seekToPosition(event);
    } else {
      this.updatePreview(event);
    }
  }

  onMouseUp(): void {
    this.isDragging = false;
  }

  onMouseEnter(): void {
    this.showPreview = true;
  }

  onMouseLeave(): void {
    this.showPreview = false;
    this.isDragging = false;
  }

  private seekToPosition(event: MouseEvent): void {
    const rect = this.progressBar.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percentage / 100) * this.duration;
    this.seek.emit(newTime);
  }

  private updatePreview(event: MouseEvent): void {
    const rect = this.progressBar.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    this.previewTime = (percentage / 100) * this.duration;
    this.previewPosition = percentage;
  }
}
