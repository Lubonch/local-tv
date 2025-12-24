import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-volume-control',
  imports: [CommonModule],
  templateUrl: './volume-control.html',
  styleUrl: './volume-control.css'
})
export class VolumeControlComponent {
  @Input() volume: number = 100;
  @Input() isMuted: boolean = false;
  @Output() volumeChange = new EventEmitter<number>();
  @Output() muteToggle = new EventEmitter<void>();

  showSlider: boolean = false;
  private sliderTimeout: any;

  get volumeIcon(): string {
    if (this.isMuted || this.volume === 0) {
      return 'M';
    } else if (this.volume < 33) {
      return '🔈';
    } else if (this.volume < 66) {
      return '🔉';
    } else {
      return '🔊';
    }
  }

  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newVolume = parseInt(target.value);
    this.volumeChange.emit(newVolume);
  }

  toggleMute(): void {
    this.muteToggle.emit();
  }

  onMouseEnter(): void {
    this.showSlider = true;
    if (this.sliderTimeout) {
      clearTimeout(this.sliderTimeout);
    }
  }

  onMouseLeave(): void {
    this.sliderTimeout = setTimeout(() => {
      this.showSlider = false;
    }, 1000);
  }
}
