import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import { DLC, Game, MetadataCacheService, CivGame } from "pydt-shared";
import { ConfigureGameModel } from "./configure-game.model";

@Component({
  selector: "pydt-configure-game",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"],
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  @Input() selectedCivs: string[];
  minHumans = 2;
  showMarkdown = false;
  games: CivGame[];

  constructor(private cdRef: ChangeDetectorRef, private metadata: MetadataCacheService) {}

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadata.getCivGameMetadata()).civGames;

    if (this.game) {
      this.minHumans = Math.max(2, this.game.players.length);
    }
  }

  get markdownButtonText(): string {
    return this.showMarkdown ? "Edit Text" : "Preview Markdown";
  }

  get allDlcSelected(): boolean {
    for (const dlc of this.model.civGame.dlcs) {
      if (!this.model.dlc[dlc.id]) {
        return false;
      }
    }

    return true;
  }

  selectAllDlc(selectAll: boolean): void {
    for (const dlc of this.model.civGame.dlcs) {
      this.model.dlc[dlc.id] = selectAll;
    }

    this.validateDlc();
  }

  get majorDlc(): DLC[] {
    return this.model.civGame.dlcs.filter(dlc => dlc.major);
  }

  get minorDlc(): DLC[] {
    return this.model.civGame.dlcs.filter(dlc => !dlc.major);
  }

  get slotsArray() {
    return new Array<number>(this.model.slots);
  }

  get slotsPreviewGame() {
    return {
      slots: this.model.slots,
      humans: this.model.humans,
    } as Game;
  }

  validateDlc(): void {
    for (const civ of this.selectedCivs) {
      const leader = this.model.civGame.leaders.find(l => l.leaderKey === civ);

      if (leader.options.dlcId) {
        if (!this.model.dlc[leader.options.dlcId]) {
          // eslint-disable-next-line no-alert
          alert("Can't deselect DLC because there's a player in the game using that DLC.");

          setTimeout(() => {
            this.model.dlc[leader.options.dlcId] = true;
            this.cdRef.detectChanges();
          }, 10);
        }
      }
    }
  }
}
