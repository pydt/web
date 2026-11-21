import { Component, Input, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService, RawCiv6Mods } from "pydt-shared";
import { NotificationService } from "../../../shared";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "pydt-game-detail-manage-mods",
  templateUrl: "./manage-mods.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ModalDirective],
})
export class GameDetailManageModsComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);

  @Input() game: Game;
  @Input() admin = false;
  @ViewChild("confirmDeleteModal", { static: true }) confirmDeleteModal: ModalDirective;

  mods: RawCiv6Mods[];
  modToDelete: RawCiv6Mods;

  newModId = "";
  newModTitle = "";

  async loadMods() {
    this.mods = await this.gameApi.getCiv6Mods(this.game.gameId).toPromise();
  }

  startDelete(mod: RawCiv6Mods) {
    this.modToDelete = mod;
    this.confirmDeleteModal.show();
  }

  async finishDelete() {
    this.confirmDeleteModal.hide();
    this.mods = await this.gameApi.deleteCiv6Mod(this.game.gameId, this.modToDelete.id).toPromise();

    this.notificationService.showAlert({
      type: "danger",
      msg: `Mod ${this.modToDelete.id} deleted!`,
    });
  }

  async addMod() {
    if (!this.newModId) {
      this.notificationService.showAlert({
        type: "danger",
        msg: `Mod ID Required!`,
      });
      return;
    }

    this.mods = await this.gameApi
      .addCiv6Mod(this.game.gameId, {
        id: this.newModId,
        title: this.newModTitle,
      })
      .toPromise();

    this.newModId = "";
    this.newModTitle = "";
  }
}
