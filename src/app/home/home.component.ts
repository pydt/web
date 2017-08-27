import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'pydt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  @ViewChild('step1ImageModal') step1ImageModal: ModalDirective;
  @ViewChild('step2ImageModal') step2ImageModal: ModalDirective;
  @ViewChild('step3ImageModal') step3ImageModal: ModalDirective;
}
