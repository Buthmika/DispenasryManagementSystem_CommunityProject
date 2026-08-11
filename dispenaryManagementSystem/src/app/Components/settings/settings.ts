import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;

  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  async onChangePassword(): Promise<void> {
    this.message = '';
    this.messageType = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.message = 'Please fill in all password fields.';
      this.messageType = 'error';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New password and confirmation do not match.';
      this.messageType = 'error';
      return;
    }

    this.loading = true;

    const result = await this.authService.changePassword(this.currentPassword, this.newPassword);

    this.loading = false;

    if (result.success) {
      this.message = 'Password updated successfully. Please use your new password next time you log in.';
      this.messageType = 'success';
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';

      const currentUser = this.authService.getCurrentUser();
      const userEmail = currentUser?.email || 'Doctor';
      this.notificationService.addNotification({
        type: 'success',
        icon: 'lock',
        message: `Password changed for ${userEmail}`,
        time: 'Just now'
      }).catch(err => console.error('Notification save failed:', err));
    } else {
      this.message = result.error || 'Unable to update password.';
      this.messageType = 'error';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
