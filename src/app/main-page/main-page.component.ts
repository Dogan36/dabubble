import { Component } from '@angular/core';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component'; 
import { ChatBoardComponent } from './chat-board/chat-board.component';
import { ThreadBoardComponent } from './thread-board/thread-board.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [WorkspaceMenuComponent, ChatBoardComponent, ThreadBoardComponent, MatSidenavModule, MatButtonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  threadOpen = true;

  closeThread() {
    this.threadOpen = false;
    console.log('thread is now', this.threadOpen);
  }
}
