import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CivDef } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-display-civ',
  templateUrl: './displayCiv.component.html'
})
export class DisplayCivComponent {
  @Input() civ: CivDef;
  @Output() click = new EventEmitter<CivDef>();

  constructor() {
  }

  imageUrl() {
    return `/img/civs/${this.civ.getImageFileName()}`;
  }

  clicked() {
    this.click.emit(this.civ);
  }
}
