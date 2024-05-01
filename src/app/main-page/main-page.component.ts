import { Component, inject } from '@angular/core';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { ChatBoardComponent } from './chat-board/chat-board.component';
import { ChannelBoardComponent } from './channel-board/channel-board.component';
import { ThreadBoardComponent } from './thread-board/thread-board.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { NewMsgBoardComponent } from './new-msg-board/new-msg-board.component';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogUserMenuComponent } from './dialogs/dialog-user-menu/dialog-user-menu.component';
import { UserType } from '../types/user.class';
import { ChannelService } from '../services/channel.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [WorkspaceMenuComponent, ChatBoardComponent, ThreadBoardComponent, MatSidenavModule, MatButtonModule, ChannelBoardComponent, NewMsgBoardComponent, MatDialogModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  authService: AuthService = inject(AuthService);
  workspaceOpen = true;
  channelChatOpen = true;
  privateChatOpen = false;
  threadOpen = true;
  newChatOpen = false;
  uid:string=''
  currentUser: UserType | null = null;

  constructor(private evtSvc: EventService, public dialog: MatDialog, public channelService: ChannelService ) {
    this.evtSvc.getThreadOpenStatus().subscribe(status => {
      this.threadOpen = status;
    });
    this.evtSvc.getChannelOpenStatus().subscribe(status => {
      this.channelChatOpen = status;
    });
    this.evtSvc.getPrivateChatOpenStatus().subscribe(status => {
      this.privateChatOpen = status;
    });
    this.evtSvc.getNewChatOpenStatus().subscribe(status => {
      this.newChatOpen = status;
    });
    this.evtSvc.getWorkspaceOpenStatus().subscribe(status => {
      this.workspaceOpen = status;
    });
  }

  ngOnInit() {
    if (window.innerWidth <= 544) {
      this.evtSvc.openChannel(false);
      this.evtSvc.openPrivateChat(false);
      this.evtSvc.openThread(false);
      this.evtSvc.openNewChat(false);
    }
  }
  

  test() {
    console.log(this.authService.currentUser.photoURL)
  }


  toggleSideNav() {
    this.workspaceOpen = !this.workspaceOpen;
  }


  openNewChat() {
    this.evtSvc.openChannel(false);
    this.evtSvc.openPrivateChat(false);
    this.evtSvc.openNewChat(true);

    if (window.innerWidth <= 544) {
      this.evtSvc.openWorkspace(false);
    }
  }

  openChanel() {
    this.evtSvc.openChannel(true);
    this.evtSvc.openPrivateChat(false);
    this.evtSvc.openNewChat(false);

    if (window.innerWidth <= 544) {
      this.evtSvc.openWorkspace(false);
    }
  }

  openPrivateChat() {
    this.evtSvc.openChannel(false);
    this.evtSvc.openPrivateChat(true);
    this.evtSvc.openNewChat(false);

    if (window.innerWidth <= 544) {
      this.evtSvc.openWorkspace(false);
    }
  }

  openWorkspace() {
    if (window.innerWidth <= 544) {
      this.evtSvc.openChannel(false);
      this.evtSvc.openPrivateChat(false);
      this.evtSvc.openNewChat(false);
      this.evtSvc.openWorkspace(true);
    }
  }


  /**
   * Opens UserMenuDialog by click
   */
  openUserMenuDialog() {
    this.dialog.open(DialogUserMenuComponent, {position: {right:'24px', top: '80px'}, panelClass: 'dialog-bor-rad-corner'});
  }
}
