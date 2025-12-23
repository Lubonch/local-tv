import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderSelectorComponent } from './components/folder-selector/folder-selector';
import { VideoPlayerComponent } from './components/video-player/video-player';
import { OverlayComponent } from './components/overlay/overlay';
import { PlaylistService } from './services/playlist.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FolderSelectorComponent,
    VideoPlayerComponent,
    OverlayComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showFolderSelector: boolean = true;

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    // Verificar si ya hay una playlist cargada
    this.playlistService.playlistLoaded$.subscribe(loaded => {
      if (loaded) {
        // Pequeño delay para mostrar el mensaje de éxito
        setTimeout(() => {
          this.showFolderSelector = false;
        }, 1500);
      }
    });
  }

  onFolderSelected(): void {
    // El folder selector ya maneja la lógica,
    // aquí solo esperamos a que la playlist esté cargada
  }
}
