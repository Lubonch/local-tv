import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-weather-icon',
  imports: [CommonModule],
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" [innerHTML]="iconSvg"></svg>
  `,
  styles: [`
    svg {
      display: inline-block;
      vertical-align: middle;
    }
  `]
})
export class WeatherIconComponent {
  @Input() weatherCode: number = 0;
  @Input() size: number = 48;

  constructor(private sanitizer: DomSanitizer) {}

  get iconSvg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.getWeatherIconSvg(this.weatherCode));
  }

  private getWeatherIconSvg(code: number): string {
    if (code === 0) {
      return `
        <circle cx="32" cy="32" r="12" fill="#FDB813"/>
        <g stroke="#FDB813" stroke-width="3" stroke-linecap="round">
          <line x1="32" y1="8" x2="32" y2="14"/>
          <line x1="32" y1="50" x2="32" y2="56"/>
          <line x1="8" y1="32" x2="14" y2="32"/>
          <line x1="50" y1="32" x2="56" y2="32"/>
          <line x1="14" y1="14" x2="18" y2="18"/>
          <line x1="46" y1="46" x2="50" y2="50"/>
          <line x1="14" y1="50" x2="18" y2="46"/>
          <line x1="46" y1="18" x2="50" y2="14"/>
        </g>
      `;
    }

    if (code <= 3) {
      return `
        <circle cx="28" cy="24" r="10" fill="#FDB813"/>
        <path d="M16,40 Q16,34 22,34 Q22,30 26,30 Q30,30 32,34 Q38,34 38,40 Q38,46 32,46 L22,46 Q16,46 16,40 Z" fill="#E8E8E8"/>
      `;
    }

    if (code <= 48) {
      return `
        <g opacity="0.7">
          <rect x="12" y="20" width="40" height="24" rx="4" fill="#D3D3D3"/>
          <rect x="16" y="28" width="32" height="2" fill="#A0A0A0" opacity="0.3"/>
          <rect x="16" y="34" width="32" height="2" fill="#A0A0A0" opacity="0.3"/>
          <rect x="16" y="40" width="32" height="2" fill="#A0A0A0" opacity="0.3"/>
        </g>
      `;
    }

    if (code <= 55 || (code >= 80 && code <= 82)) {
      return `
        <path d="M16,28 Q16,22 22,22 Q22,18 26,18 Q30,18 32,22 Q38,22 38,28 Q38,34 32,34 L22,34 Q16,34 16,28 Z" fill="#B0C4DE"/>
        <g stroke="#4682B4" stroke-width="2" stroke-linecap="round">
          <line x1="20" y1="38" x2="18" y2="44"/>
          <line x1="26" y1="38" x2="24" y2="44"/>
          <line x1="32" y1="38" x2="30" y2="44"/>
        </g>
      `;
    }

    if (code <= 65) {
      return `
        <path d="M16,24 Q16,18 22,18 Q22,14 26,14 Q30,14 32,18 Q38,18 38,24 Q38,30 32,30 L22,30 Q16,30 16,24 Z" fill="#778899"/>
        <g stroke="#4682B4" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="34" x2="16" y2="42"/>
          <line x1="24" y1="34" x2="22" y2="42"/>
          <line x1="30" y1="34" x2="28" y2="42"/>
          <line x1="36" y1="34" x2="34" y2="42"/>
          <line x1="21" y1="38" x2="19" y2="46"/>
          <line x1="27" y1="38" x2="25" y2="46"/>
          <line x1="33" y1="38" x2="31" y2="46"/>
        </g>
      `;
    }

    if (code <= 77 || code === 85 || code === 86) {
      return `
        <path d="M16,24 Q16,18 22,18 Q22,14 26,14 Q30,14 32,18 Q38,18 38,24 Q38,30 32,30 L22,30 Q16,30 16,24 Z" fill="#B0C4DE"/>
        <g fill="#E0F0FF">
          <path d="M20,36 L22,34 L24,36 L22,38 Z"/>
          <path d="M28,36 L30,34 L32,36 L30,38 Z"/>
          <path d="M36,36 L38,34 L40,36 L38,38 Z"/>
          <path d="M24,42 L26,40 L28,42 L26,44 Z"/>
          <path d="M32,42 L34,40 L36,42 L34,44 Z"/>
        </g>
      `;
    }

    if (code >= 95) {
      return `
        <path d="M16,24 Q16,18 22,18 Q22,14 26,14 Q30,14 32,18 Q38,18 38,24 Q38,30 32,30 L22,30 Q16,30 16,24 Z" fill="#4B5563"/>
        <g stroke="#FDB813" stroke-width="2.5" stroke-linecap="round">
          <polyline points="28,34 24,42 28,42 24,50" fill="none"/>
          <polyline points="36,36 32,44 36,44 32,52" fill="none"/>
        </g>
      `;
    }

    return `
      <path d="M16,28 Q16,22 22,22 Q22,18 26,18 Q30,18 32,22 Q38,22 38,28 Q38,34 32,34 L22,34 Q16,34 16,28 Z" fill="#D3D3D3"/>
    `;
  }
}
