import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DialogComponent } from './Components/core/dialog/dialog';

@Component({
  selector: 'app-root',
  standalone: true,  

  imports: [RouterOutlet, DialogComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App { 

  protected readonly title = signal('dispenaryManagementSystem');
}