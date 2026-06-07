import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppService } from '../../core/services/app.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
})
export class BottomNavComponent {
  private readonly app = inject(AppService);

  onHomeTap(): void {
    if (this.app.phase() === 'playing') {
      this.app.pauseGame();
    }
    // Navigation is handled by the routerLink directive on the element
  }
}
