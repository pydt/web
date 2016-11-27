import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService, CivDef, Civ6Leaders } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-select-civ',
  templateUrl: './selectCiv.component.html',
  styleUrls: ['./selectCiv.component.scss']
})
export class SelectCivComponent implements OnInit {
  @Input() curCiv: CivDef;
  @Output() selectedCiv = new EventEmitter<CivDef>();
  leaders = Civ6Leaders;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
  }

  civClicked(civ: CivDef) {
    this.selectedCiv.emit(civ);
  }
}
