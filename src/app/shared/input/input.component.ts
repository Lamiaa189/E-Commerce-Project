import { Component, input, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  control = input.required<any>();
  inputType = input.required<string>();
  inputId = input.required<string>();
  inputLabel = input.required<string>();
  patternMessage = input<string>();

  showPassword = signal<boolean>(false);
}
