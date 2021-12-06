import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { CivDef, MetadataCacheService } from "pydt-shared";
import { ModalDirective } from "ngx-bootstrap/modal";

@Component({
  selector: "pydt-select-civ",
  templateUrl: "./select-civ.component.html",
  styleUrls: ["./select-civ.component.scss"],
})
export class SelectCivComponent implements OnInit {
  @Input() curCiv: CivDef;
  @Input() leaders: CivDef[];
  @Input() randomOnly = false;
  @Output() selectedCiv = new EventEmitter<CivDef>();
  @ViewChild("selectCivModal", { static: true }) selectCivModal: ModalDirective;

  RANDOM_CIV: CivDef;

  constructor(private metadataCache: MetadataCacheService) {
  }

  async ngOnInit(): Promise<void> {
    this.RANDOM_CIV = (await this.metadataCache.getCivGameMetadata()).randomCiv;
  }

  civClicked(civ: CivDef): void {
    this.selectedCiv.emit(civ);
  }
}
