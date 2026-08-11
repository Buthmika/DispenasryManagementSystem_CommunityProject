import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, User, updatePassword, reauthenticateWithCredential } from '@angular/fire/auth';
import { EmailAuthProvider } from 'firebase/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserRole {
  email: string;
  role: 'doctor' | 'admin' | 'pharmacist' | 'manager';
  displayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  private currentUserRoleSubject = new BehaviorSubject<string | null>(null);
  public currentUserRole$: Observable<string | null> = this.currentUserRoleSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Monitor auth state
    this.auth.onAuthStateChanged(async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserRole;
          const normalizedRole = String(userData.role || '').toLowerCase();
          this.currentUserRoleSubject.next(normalizedRole);
        } else {
          this.currentUserRoleSubject.next(null);
        }
      } else {
        this.currentUserRoleSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserRole;
        const role = String(userData.role || '').toLowerCase();
        this.currentUserRoleSubject.next(role);

        // Navigate based on role
        switch (role) {
          case 'doctor':
            this.router.navigate(['/doctor-dashboard']);
            break;
          case 'admin':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'manager':
            this.router.navigate(['/reports']);
            break;
          case 'pharmacist':
            this.router.navigate(['/reports']);
            break;
          default:
            this.router.navigate(['/login']);
        }

        return { success: true, role };
      } else {
        await this.logout();
        return { success: false, error: 'User role not found. Contact administrator.' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Contact administrator for account creation.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Wrong email or password.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Firestore access denied. Check Firestore rules for the users collection.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserRole(): string | null {
    return this.currentUserRoleSubject.value;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const user = this.auth.currentUser;

    if (!user || !user.email) {
      return { success: false, error: 'No authenticated user found. Please log in again.' };
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      console.error('Change password error:', error);

      let errorMessage = 'Unable to change password. Please try again.';

      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The new password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign in again before changing your password.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
