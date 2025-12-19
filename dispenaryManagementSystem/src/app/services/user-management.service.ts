import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, setDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

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
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, password);
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

      await this.loadUsers();
      return { success: true, userId: firebaseUserId };
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Failed to create user';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
      
      return { success: false, error: errorMessage };
    }
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
