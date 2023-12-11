import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Game } from "pydt-shared";

@Component({
  selector: "pydt-game-detail-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class GameDetailAdminComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
}
