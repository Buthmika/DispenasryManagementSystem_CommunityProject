import { Component } from '@angular/core';
<<<<<<< Updated upstream
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
=======
import { RouterLink } from '@angular/router';
>>>>>>> Stashed changes

@Component({
  selector: 'app-login',
  standalone: true,
<<<<<<< Updated upstream
  imports: [CommonModule, FormsModule],
=======
  imports: [RouterLink],
>>>>>>> Stashed changes
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const result = await this.authService.login(this.email, this.password);

    this.isLoading = false;

    if (!result.success) {
      this.errorMessage = result.error || 'Login failed';
    }
    // Navigation is handled by the auth service
  }
}
