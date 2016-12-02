import { Component, Input, OnInit } from '@angular/core';
import { Game } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-configure-game',
  templateUrl: './config.component.html'
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  private minHumans = 2;

  ngOnInit() {
    if (this.game) {
      this.minHumans = this.game.humans;
    }
  }
}

export class ConfigureGameModel {
  private _slots = 4;

  public displayName: string;
  public description: string;
  public humans: number = 4;

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

  toJSON() {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this.slots,
      humans: this.humans
    };
  }
}
