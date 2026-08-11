import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from '@angular/fire/firestore';

export interface NotificationItem {
  id?: string;
  type: 'success' | 'info' | 'warning';
  message: string;
  icon: string;
  time?: string;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private firestore: Firestore) {}

  subscribeNotifications(callback: (notifications: NotificationItem[]) => void): () => void {
    const notificationsRef = collection(this.firestore, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as NotificationItem)
      }));
      callback(items);
    }, (error) => {
      console.error('Notification subscription failed:', error);
    });

    return unsubscribe;
  }

  async addNotification(notification: Omit<NotificationItem, 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      await addDoc(notificationsRef, {
        ...notification,
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error: any) {
      console.error('Add notification failed:', error);
      return { success: false, error: error?.message || 'Failed to save notification.' };
    }
  }
}
