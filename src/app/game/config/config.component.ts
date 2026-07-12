import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";
import {
  DLC,
  DlcGroup,
  Game,
  MetadataCacheService,
  CivGame,
  RANDOM_ONLY_OPTIONS,
  TURN_TIMER_VACATION_OPTIONS,
} from "pydt-shared";
import { ConfigureGameModel } from "./configure-game.model";

@Component({
  selector: "pydt-configure-game",
  templateUrl: "./config.component.html",
  styleUrls: ["./config.component.css"],
  standalone: false,
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  @Input() selectedCivs: string[];
  minHumans = 2;
  showMarkdown = false;
  games: CivGame[];
  RANDOM_ONLY_OPTIONS = RANDOM_ONLY_OPTIONS;
  TURN_TIMER_VACATION_OPTIONS = TURN_TIMER_VACATION_OPTIONS;

  constructor(
    private cdRef: ChangeDetectorRef,
    private metadata: MetadataCacheService,
  ) {}

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
      this.model.dlc[dlc.id] = selectAll && !dlc.community;
    }

    this.validateDlc();
  }

  // Dlc ids that belong to a group are rendered nested under that group instead of
  // in the flat community/major/minor lists.
  private get groupedDlcIds(): Set<string> {
    return new Set((this.model.civGame.dlcGroups ?? []).flatMap(group => group.dlcIds));
  }

  dlcsInGroup(group: DlcGroup): DLC[] {
    return group.dlcIds
      .map(id => this.model.civGame.dlcs.find(dlc => dlc.id === id))
      .filter((dlc): dlc is DLC => !!dlc);
  }

  get communityDlc(): DLC[] {
    return this.model.civGame.dlcs.filter(dlc => dlc.community && !this.groupedDlcIds.has(dlc.id));
  }

  get majorDlc(): DLC[] {
    return this.model.civGame.dlcs.filter(dlc => dlc.major && !dlc.community && !this.groupedDlcIds.has(dlc.id));
  }

  get minorDlc(): DLC[] {
    return this.model.civGame.dlcs.filter(dlc => !dlc.major && !dlc.community && !this.groupedDlcIds.has(dlc.id));
  }

  get communityDlcGroups(): DlcGroup[] {
    return (this.model.civGame.dlcGroups ?? []).filter(group => group.community);
  }

  get majorDlcGroups(): DlcGroup[] {
    return (this.model.civGame.dlcGroups ?? []).filter(group => group.major && !group.community);
  }

  get minorDlcGroups(): DlcGroup[] {
    return (this.model.civGame.dlcGroups ?? []).filter(group => !group.major && !group.community);
  }

  dlcGroupSelected(group: DlcGroup): boolean {
    return group.dlcIds.every(id => this.model.dlc[id]);
  }

  setDlcGroup(group: DlcGroup, selected: boolean): void {
    for (const id of group.dlcIds) {
      this.model.dlc[id] = selected;
    }

    this.validateDlc();
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
    const civGame = this.model.civGame;

    for (const civType of this.selectedCivs) {
      const leader = civGame.leaders.find(l => l.leaderKey === civType);

      if (leader?.options.dlcId && !this.model.dlc[leader.options.dlcId]) {
        // eslint-disable-next-line no-alert
        alert("Can't deselect DLC because there's a player in the game using that DLC.");

        setTimeout(() => {
          this.model.dlc[leader.options.dlcId] = true;
          this.cdRef.detectChanges();
        }, 10);

        return;
      }
    }

    if (civGame.separateLeaderCiv && this.game?.players) {
      for (const player of this.game.players) {
        const civilization = civGame.civilizations?.find(c => c.civKey === player.civilization);

        if (civilization?.options.dlcId && !this.model.dlc[civilization.options.dlcId]) {
          // eslint-disable-next-line no-alert
          alert("Can't deselect DLC because there's a player in the game using that DLC.");

          setTimeout(() => {
            this.model.dlc[civilization.options.dlcId] = true;
            this.cdRef.detectChanges();
          }, 10);

          return;
        }
      }
    }
  }
}
