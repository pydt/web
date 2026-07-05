import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CivDef, CivGame, Game, MetadataCacheService } from "pydt-shared";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FormControl } from "@angular/forms";
import { map } from "rxjs";
import { AvailableCiv } from "../detail/detail.component";

@Component({
  selector: "pydt-select-civ",
  templateUrl: "./select-civ.component.html",
  styleUrls: ["./select-civ.component.scss"],
  standalone: false,
})
export class SelectCivComponent implements OnInit {
  @Input() curCiv: AvailableCiv;
  @Input() curCivilization?: CivDef;
  @Input() leaders: AvailableCiv[];
  @Input() availableCivilizations: CivDef[] = [];
  @Input() civGame?: CivGame;
  @Input() randomOnly: Game.RandomOnlyEnum = "EITHER";
  @Output() selectedCiv = new EventEmitter<AvailableCiv>();
  @Output() selectedCivilization = new EventEmitter<CivDef>();
  @ViewChild("selectCivModal", { static: true }) selectCivModal: ModalDirective;
  @ViewChild("selectCivilizationModal", { static: false }) selectCivilizationModal: ModalDirective;

  civFilter = new FormControl<string>("");
  civilizationFilter = new FormControl<string>("");

  filteredCivs$ = this.civFilter.valueChanges.pipe(
    map(x => (this.leaders || []).filter(y => !x || y.fullDisplayName.toUpperCase().includes(x.toUpperCase()))),
  );

  filteredCivilizations$ = this.civilizationFilter.valueChanges.pipe(
    map(x =>
      (this.availableCivilizations || []).filter(y => !x || y.fullDisplayName.toUpperCase().includes(x.toUpperCase())),
    ),
  );

  RANDOM_CIV: CivDef;

  constructor(private metadataCache: MetadataCacheService) {}

  async ngOnInit(): Promise<void> {
    this.RANDOM_CIV = (await this.metadataCache.getCivGameMetadata()).randomCiv;
  }

  get separateLeaderCiv(): boolean {
    return !!this.civGame?.separateLeaderCiv;
  }

  civClicked(civ: CivDef): void {
    this.selectedCiv.emit(civ);
  }

  civilizationClicked(civ: CivDef): void {
    this.selectedCivilization.emit(civ);
  }

  showModal() {
    this.civFilter.setValue("");
    this.selectCivModal.show();
  }

  showCivilizationModal() {
    this.civilizationFilter.setValue("");
    this.selectCivilizationModal.show();
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
