import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, query } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Patient } from '../models/patient.model'; 

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private firestore = inject(Firestore);
  
  // The "Stream" that auto-updates your pages
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor() {
    this.loadPatients(); 
  }

  async loadPatients() {
    try {
      const colRef = collection(this.firestore, 'patients');
      const q = query(colRef); 
      const snapshot = await getDocs(q);
      
      const patients = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as unknown as Patient;
      });

      this.patientsSubject.next(patients);
      
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  }

  // Helper for Dashboard & Report Cards
  getStatistics() {
    const patients = this.patientsSubject.value;
    return {
      total: patients.length,
      // Safe check for "Active", "active", or "ACTIVE"
      active: patients.filter(p => p.status && p.status.toLowerCase() === 'active').length,
      // Check for boolean true or string 'true'
      pregnant: patients.filter(p => p.isPregnant === true || p.isPregnant === 'true').length
    };
  }
}