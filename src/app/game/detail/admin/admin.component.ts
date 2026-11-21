import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from "@angular/core";
import { Game } from "pydt-shared";
import { TabsetComponent, TabDirective } from "ngx-bootstrap/tabs";
import { GameDetailAdminKickPlayerComponent } from "./kick-player/kick-player.component";
import { GameDetailAdminResetGameComponent } from "./reset-game/reset-game.component";
import { GameDetailAdminRestartGameComponent } from "./restart-game/restart-game.component";
import { GameDetailAdminCloneGameComponent } from "./clone-game/clone-game.component";
import { GameDetailAdminMarkSubstitutionComponent } from "./mark-substitution/mark-substitution.component";
import { GameDetailManageModsComponent } from "../manage-mods/manage-mods.component";

@Component({
  selector: "pydt-game-detail-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TabsetComponent,
    TabDirective,
    GameDetailAdminKickPlayerComponent,
    GameDetailAdminResetGameComponent,
    GameDetailAdminRestartGameComponent,
    GameDetailAdminCloneGameComponent,
    GameDetailAdminMarkSubstitutionComponent,
    GameDetailManageModsComponent,
  ],
})
export class GameDetailAdminComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
}
