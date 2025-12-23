import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { FolderSelectorComponent } from './components/folder-selector/folder-selector.component';

import { FileSystemService } from './services/file-system.service';
import { StorageService } from './services/storage.service';
import { PlaylistService } from './services/playlist.service';
import { WeatherService } from './services/weather.service';
import { ClockService } from './services/clock.service';

@NgModule({
  declarations: [
    AppComponent,
    VideoPlayerComponent,
    OverlayComponent,
    FolderSelectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    FileSystemService,
    StorageService,
    PlaylistService,
    WeatherService,
    ClockService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
