import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SubtitleTrack {
  index: number;
  label: string;
  language?: string;
  kind: 'subtitles' | 'captions';
}

export interface AudioTrack {
  index: number;
  label: string;
  language?: string;
}

@Component({
  selector: 'app-subtitle-control',
  imports: [CommonModule],
  templateUrl: './subtitle-control.html',
  styleUrl: './subtitle-control.css'
})
export class SubtitleControlComponent {
  @Input() subtitleTracks: SubtitleTrack[] = [];
  @Input() audioTracks: AudioTrack[] = [];
  @Input() currentSubtitleIndex: number = -1;
  @Input() currentAudioIndex: number = 0;
  @Output() subtitleChange = new EventEmitter<number>();
  @Output() audioChange = new EventEmitter<number>();

  showSubtitleMenu: boolean = false;
  showAudioMenu: boolean = false;
  private menuTimeout: any;

  toggleSubtitleMenu(): void {
    this.showSubtitleMenu = !this.showSubtitleMenu;
    this.showAudioMenu = false;
  }

  toggleAudioMenu(): void {
    this.showAudioMenu = !this.showAudioMenu;
    this.showSubtitleMenu = false;
  }

  selectSubtitle(index: number): void {
    this.subtitleChange.emit(index);
    this.showSubtitleMenu = false;
  }

  selectAudio(index: number): void {
    this.audioChange.emit(index);
    this.showAudioMenu = false;
  }

  onMouseLeave(): void {
    this.menuTimeout = setTimeout(() => {
      this.showSubtitleMenu = false;
      this.showAudioMenu = false;
    }, 500);
  }

  onMouseEnter(): void {
    if (this.menuTimeout) {
      clearTimeout(this.menuTimeout);
    }
  }

  get hasSubtitles(): boolean {
    return this.subtitleTracks.length > 0;
  }

  get hasMultipleAudio(): boolean {
    return this.audioTracks.length > 1;
  }
}
