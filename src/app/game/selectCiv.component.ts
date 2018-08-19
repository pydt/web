import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CivDef, RANDOM_CIV } from 'pydt-shared';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'pydt-select-civ',
  templateUrl: './selectCiv.component.html',
  styleUrls: ['./selectCiv.component.scss']
})
export class SelectCivComponent implements OnInit {
  @Input() curCiv: CivDef;
  @Input() leaders: CivDef[];
  @Input() randomOnly = false;
  @Output() selectedCiv = new EventEmitter<CivDef>();
  @ViewChild('selectCivModal') selectCivModal: ModalDirective;

  RANDOM_CIV = RANDOM_CIV;

  constructor() {
  }

  ngOnInit() {
  }

  civClicked(civ: CivDef) {
    this.selectedCiv.emit(civ);
  }
}
