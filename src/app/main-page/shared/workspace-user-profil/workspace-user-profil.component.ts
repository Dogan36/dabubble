import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-workspace-user-profil',
  standalone: true,
  imports: [],
  templateUrl: './workspace-user-profil.component.html',
  styleUrl: './workspace-user-profil.component.scss'
})
export class WorkspaceUserProfilComponent {

  @Input() userName: string = '';
  @Input() userImage: string = '';

}
