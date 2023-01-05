import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CivDef, Game, MetadataCacheService } from "pydt-shared";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormControl } from "@angular/forms";
import { map } from "rxjs";

@Component({
  selector: "pydt-select-civ",
  templateUrl: "./select-civ.component.html",
  styleUrls: ["./select-civ.component.scss"],
})
export class SelectCivComponent implements OnInit {
  @Input() curCiv: CivDef;
  @Input() leaders: CivDef[];
  @Input() randomOnly: Game.RandomOnlyEnum = "EITHER";
  @Output() selectedCiv = new EventEmitter<CivDef>();
  @ViewChild("selectCivModal", { static: true }) selectCivModal: ModalDirective;

  civFilter = new FormControl<string>("");

  filteredCivs$ = this.civFilter.valueChanges.pipe(
    map(x => (this.leaders || []).filter(y => !x || y.fullDisplayName.toUpperCase().includes(x.toUpperCase()))),
  );

  RANDOM_CIV: CivDef;

  constructor(private metadataCache: MetadataCacheService) {}

  async ngOnInit(): Promise<void> {
    this.RANDOM_CIV = (await this.metadataCache.getCivGameMetadata()).randomCiv;
  }

  civClicked(civ: CivDef): void {
    this.selectedCiv.emit(civ);
  }

  showModal() {
    this.civFilter.setValue("");
    this.selectCivModal.show();
  }

  showCiv(civ?: CivDef): boolean {
    if (this.randomOnly === "EITHER") {
      return true;
    }

    if (this.randomOnly === "FORCE_LEADER") {
      return civ?.civKey !== this.RANDOM_CIV?.civKey;
    }

    return civ?.civKey === this.RANDOM_CIV?.civKey;
  }
}
