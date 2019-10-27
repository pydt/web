import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Game } from 'pydt-shared';
import { ConfigureGameModel } from './configure-game.model';

@Component({
  selector: 'pydt-configure-game',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  @Input() selectedCivs: string[];
  minHumans = 2;
  showMarkdown = false;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.game) {
      this.minHumans = Math.max(2, this.game.players.length);
    }
  }

  get markdownButtonText() {
    return this.showMarkdown ? 'Edit Text' : 'Preview Markdown';
  }

  get allDlcSelected() {
    for (const dlc of this.model.civGame.dlcs) {
      if (!this.model.dlc[dlc.id]) {
        return false;
      }
    }

    return true;
  }

  selectAllDlc(selectAll: boolean) {
    for (const dlc of this.model.civGame.dlcs) {
      this.model.dlc[dlc.id] = selectAll;
    }
  }

  get majorDlc() {
    return this.model.civGame.dlcs.filter(dlc => {
      return dlc.major;
    });
  }

  get minorDlc() {
    return this.model.civGame.dlcs.filter(dlc => {
      return !dlc.major;
    });
  }

  validateDlc() {
    for (const civ of this.selectedCivs) {
      const leader = this.model.civGame.leaders.find(l => {
        return l.leaderKey === civ;
      });

      if (leader.options.dlcId) {
        if (!this.model.dlc[leader.options.dlcId]) {
          alert(`Can't deselect DLC because there's a player in the game using that DLC.`);

          setTimeout(() => {
            this.model.dlc[leader.options.dlcId] = true;
            this.cdRef.detectChanges();
          }, 10);

          return;
        }
      }
    }
  }
}
