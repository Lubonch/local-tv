import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-random-mode-indicator',
  imports: [CommonModule],
  templateUrl: './random-mode-indicator.html',
  styleUrl: './random-mode-indicator.css'
})
export class RandomModeIndicatorComponent {
  showTooltip: boolean = false;
}
