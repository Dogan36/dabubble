import { Component, Output, EventEmitter } from '@angular/core';
import { TextareaMainPageComponent } from '../shared/textarea-main-page/textarea-main-page.component';

@Component({
  selector: 'app-thread-board',
  standalone: true,
  imports: [TextareaMainPageComponent],
  templateUrl: './thread-board.component.html',
  styleUrl: './thread-board.component.scss'
})
export class ThreadBoardComponent {

  @Output() closeThread = new EventEmitter<void>();

  onCloseThread() {
    this.closeThread.emit();
  }
}
