import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Game, Civ6DLCs, Civ6Leaders, DLC } from 'pydt-shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-configure-game',
  templateUrl: './config.component.html'
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  @Input() selectedCivs: string[];
  private minHumans = 2;
  private dlcOptions = Civ6DLCs;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.game) {
      this.minHumans = this.game.humans;
    }
  }

  validateDlc(dlc: DLC) {
    for (let civ of this.selectedCivs) {
      const leader = _.find(Civ6Leaders, leader => {
        return leader.leaderKey === civ;
      });

      if (leader.dlcId) {
        const foundDlc = _.some(_.keys(this.model.dlc), key => {
          return this.model.dlc[key];
        });

        if (!foundDlc) {
          alert('Can\'t deselect DLC because there\'s a player in the game using that DLC.');
          setTimeout(() => {
            this.model.dlc[leader.dlcId] = true;
            this.cdRef.detectChanges();
          }, 10);
        }
      }
    }
  }
}

export class ConfigureGameModel {
  private _slots = 4;

  public displayName: string;
  public description: string;
  public humans: number = 4;
  public dlc = new Map<string, boolean>();
  public password: string;

  set slots(slots: number) {
    this._slots = Number(slots);

    // I think the range slider sends through strings, make sure we compare as numbers...
    if (Number(slots) < Number(this.humans)) {
      this.humans = slots;
    }
  }

  get slots() {
    return this._slots;
  }

  dlcSelected(dlc: DLC) {
    return _.some(this.dlc.keys(), key => {
      return key === dlc.id && this.dlc[key];
    });
  }

  dlcIdArray() {
    return _.filter(_.keys(this.dlc), key => {
      return this.dlc[key];
    });
  }

  toJSON() {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this.slots,
      humans: this.humans,
      password: this.password,
      dlc: this.dlcIdArray()
    };
  }
}
