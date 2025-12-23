import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-info-overlay',
  imports: [CommonModule],
  templateUrl: './video-info-overlay.html',
  styleUrl: './video-info-overlay.css'
})
export class VideoInfoOverlayComponent {
  @Input() videoName: string = '';
  @Input() showInfo: boolean = false;

  get displayName(): string {
    if (!this.videoName) return '';
    const lastDotIndex = this.videoName.lastIndexOf('.');
    return lastDotIndex > 0 ? this.videoName.substring(0, lastDotIndex) : this.videoName;
  }
}
