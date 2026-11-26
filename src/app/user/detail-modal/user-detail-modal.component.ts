import { Component, ViewChild, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { User, UserService } from "pydt-shared";
import { firstValueFrom } from "rxjs";
import { UserInfoComponent } from "../info/info.component";

// The "User Info" pop-up for any player: profile, stats and turn charts. Pages can project extra
// content (like the game admin's change-civ / remove cards) below the info, using user() to read
// who is being shown.
@Component({
  selector: "pydt-user-detail-modal",
  templateUrl: "./user-detail-modal.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ModalDirective, UserInfoComponent],
})
export class UserDetailModalComponent {
  private userApi = inject(UserService);

  @ViewChild("modal", { static: true }) modal: ModalDirective;
  readonly user = signal<User | null>(null);
  // Guards against a slow response for an earlier click replacing the user clicked last
  private requestedSteamId: string | null = null;

  async show(steamId: string): Promise<void> {
    if (!steamId) {
      return;
    }

    this.requestedSteamId = steamId;
    this.user.set(null);
    this.modal.show();

    const user = await firstValueFrom(this.userApi.byId(steamId));

    if (this.requestedSteamId === steamId) {
      this.user.set(user);
    }
  }

  hide(): void {
    this.modal.hide();
  }
}
