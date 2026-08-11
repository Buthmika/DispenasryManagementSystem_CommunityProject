import { R } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css'],
})
export class SideBar {
  constructor(public authService: AuthService) {}
}
