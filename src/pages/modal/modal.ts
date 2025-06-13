import { Component,Input, Output, EventEmitter } from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input() message = 'Are you sure?';
  @Input() visible = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

}
