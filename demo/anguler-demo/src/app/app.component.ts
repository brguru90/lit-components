import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BtnWrapperComponent} from "./btn-wrapper/btn-wrapper.component"

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,BtnWrapperComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'anguler-demo';
}
