import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SubtitleTrack {
  index: number;
  label: string;
  language?: string;
  kind: 'subtitles' | 'captions';
}

@Component({
  selector: 'app-subtitle-control',
  imports: [CommonModule],
  templateUrl: './subtitle-control.html',
  styleUrl: './subtitle-control.css'
})
export class SubtitleControlComponent {
  @Input() subtitles: SubtitleTrack[] = [];
  @Input() currentSubtitleIndex: number = -1;
  @Output() subtitleChange = new EventEmitter<number>();

  showMenu: boolean = false;
  private menuTimeout: any;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
    if (this.showMenu && this.menuTimeout) {
      clearTimeout(this.menuTimeout);
    }
  }

  selectSubtitle(index: number): void {
    this.subtitleChange.emit(index);
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

  get hasSubtitles(): boolean {
    return this.subtitles.length > 0;
  }
}
