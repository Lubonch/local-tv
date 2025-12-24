import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AudioTrack {
  index: number;
  label: string;
  language?: string;
  kind: string;
}

@Component({
  selector: 'app-audio-track-control',
  imports: [CommonModule],
  templateUrl: './audio-track-control.html',
  styleUrl: './audio-track-control.css'
})
export class AudioTrackControlComponent {
  @Input() audioTracks: AudioTrack[] = [];
  @Input() currentAudioIndex: number = 0;
  @Output() audioTrackChange = new EventEmitter<number>();

  showMenu: boolean = false;
  private menuTimeout: any;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
    if (this.showMenu && this.menuTimeout) {
      clearTimeout(this.menuTimeout);
    }
  }

  selectAudioTrack(index: number): void {
    this.audioTrackChange.emit(index);
    this.closeMenuDelayed();
  }

  onMouseEnter(): void {
    this.showMenu = true;
    if (this.menuTimeout) {
      clearTimeout(this.menuTimeout);
    }
  }

  onMouseLeave(): void {
    this.closeMenuDelayed();
  }

  private closeMenuDelayed(): void {
    this.menuTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 1000);
  }

  get hasMultipleTracks(): boolean {
    return this.audioTracks.length > 1;
  }
}
