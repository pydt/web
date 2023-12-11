import { Component, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService, RawCiv6Mods } from "pydt-shared";
import { NotificationService } from "../../../../shared";

@Component({
  selector: "pydt-game-detail-admin-manage-mods",
  templateUrl: "./manage-mods.component.html",
})
export class GameDetailAdminManageModsComponent {
  @Input() game: Game;
  @ViewChild("confirmDeleteModal", { static: true }) confirmDeleteModal: ModalDirective;

  mods: RawCiv6Mods[];
  modToDelete: RawCiv6Mods;

  newModId = "";
  newModTitle = "";

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
  ) {}

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
