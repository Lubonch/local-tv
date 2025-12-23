import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FolderSelectorComponent } from './components/folder-selector/folder-selector';
import { VideoPlayerComponent } from './components/video-player/video-player';
import { PlaylistService } from './services/playlist.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FolderSelectorComponent,
    VideoPlayerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showFolderSelector: boolean = true;

  constructor(private playlistService: PlaylistService) {}

  ngOnInit(): void {
    // Verificar si ya hay una playlist cargada
    this.playlistService.playlistLoaded$.subscribe(loaded => {
      if (loaded) {
        // Ocultar selector y mostrar video player inmediatamente
        this.showFolderSelector = false;
      }
    });
  }

  onFolderSelected(): void {
    // El folder selector ya maneja la lógica,
    // aquí solo esperamos a que la playlist esté cargada
  }
}
