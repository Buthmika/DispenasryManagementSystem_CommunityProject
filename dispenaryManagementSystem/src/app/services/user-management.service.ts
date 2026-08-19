import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail } from '@angular/fire/auth';
import { initializeApp } from 'firebase/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SystemUser {
  id?: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Doctor' | 'Manager';
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private usersSubject = new BehaviorSubject<SystemUser[]>([]);
  public users$ = this.usersSubject.asObservable();
  private provisionApp = initializeApp(environment.firebaseConfig, 'admin-user-provisioning');
  private provisionAuth = getAuth(this.provisionApp);

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    try {
      const usersCollection = collection(this.firestore, 'systemUsers');
      const querySnapshot = await getDocs(usersCollection);
      
      const users: SystemUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          username: data['username'] || '',
          email: data['email'] || '',
          role: data['role'] || 'Doctor',
          fullName: data['fullName'] || '',
          createdAt: data['createdAt']?.toDate(),
          updatedAt: data['updatedAt']?.toDate()
        });
      });
      
      this.usersSubject.next(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async createUser(user: SystemUser, password: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // Create user in a separate Firebase Auth instance so the admin session stays signed in
      const userCredential = await createUserWithEmailAndPassword(this.provisionAuth, user.email, password);
      const firebaseUserId = userCredential.user.uid;

      // Map role to lowercase for auth service
      const roleMap: { [key: string]: string } = {
        'Administrator': 'admin',
        'Doctor': 'doctor',
        'Manager': 'pharmacist'
      };

      // Save user details in Firestore 'users' collection for auth
      const userDocRef = doc(this.firestore, 'users', firebaseUserId);
      await setDoc(userDocRef, {
        email: user.email,
        role: roleMap[user.role] || 'doctor',
        displayName: user.fullName
      });

      // Save user details in 'systemUsers' collection for management
      const systemUsersCollection = collection(this.firestore, 'systemUsers');
      await addDoc(systemUsersCollection, {
        firebaseUserId: firebaseUserId,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      let emailError: string | undefined;
      try {
        // Send a secure Firebase password setup link to the new user.
        await sendPasswordResetEmail(this.provisionAuth, user.email);
      } catch (error: any) {
        console.error('Password setup email failed:', error);
        emailError = this.getEmailError(error);
      }

      await this.loadUsers();

      // End the temporary provisioning session so the main admin session stays untouched.
      await this.provisionAuth.signOut();
      return { success: true, userId: firebaseUserId, error: emailError };
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Firestore access denied. Check Firestore rules for users and systemUsers.';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  private getEmailError(error: any): string {
    if (error?.code === 'auth/invalid-email') {
      return 'The email address is invalid.';
    }
    if (error?.code === 'auth/too-many-requests') {
      return 'Too many email requests. Please wait and try again.';
    }
    if (error?.code === 'auth/network-request-failed') {
      return 'Network error while sending the email.';
    }
    return 'Firebase could not send the email. Check Authentication email templates and authorized domains.';
  }

  async updateUser(userId: string, updates: Partial<SystemUser>): Promise<{ success: boolean; error?: string }> {
    try {
      const userDoc = doc(this.firestore, 'systemUsers', userId);
      await updateDoc(userDoc, {
        ...updates,
        updatedAt: new Date()
      });
      
      await this.loadUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userDoc = doc(this.firestore, 'systemUsers', userId);
      await deleteDoc(userDoc);
      
      await this.loadUsers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: 'Failed to delete user' };
    }
  }

  getUsers(): SystemUser[] {
    return this.usersSubject.value;
  }
}
