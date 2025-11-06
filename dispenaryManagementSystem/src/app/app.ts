import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegisterComponent } from './Components/register/register';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RegisterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('dispenaryManagementSystem');
}