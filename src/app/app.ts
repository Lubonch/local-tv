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
    this.playlistService.playlistLoaded$.subscribe(loaded => {
      if (loaded) {
        this.showFolderSelector = false;
      }
    });
  }

  onFolderSelected(): void {
  }
}
