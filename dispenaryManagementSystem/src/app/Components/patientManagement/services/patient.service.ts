import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { PatientList } from '../models/patient.interface';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patientsSubject = new BehaviorSubject<PatientList[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.loadPatients();
  }

  async loadPatients(): Promise<void> {
    try {
      const patientsCollection = collection(this.firestore, 'patients');
      const q = query(patientsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const patients: PatientList[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          patientId: data['patientId'] || doc.id,
          fullName: data['fullName'] || data['name'] || '',
          age: data['age'] || 0,
          gender: data['gender'] || '',
          category: data['category'] || '',
          phoneNumber: data['phoneNumber'] || data['contact'] || '',
          lastVisitDate: data['lastVisitDate'] || data['lastVisit'] || '',
          status: data['status'] || 'Active',
          isPregnant: data['isPregnant'] || false
        });
      });
      
      this.patientsSubject.next(patients);
    } catch (error) {
      console.error('Error loading patients:', error);
      throw error;
    }
  }

  async addPatient(patient: Omit<PatientList, 'id'>): Promise<string> {
    try {
      const patientsCollection = collection(this.firestore, 'patients');
      
      // Generate sequential patient ID
      const currentPatients = this.patientsSubject.value;
      const nextId = currentPatients.length + 1;
      const patientId = `PAT${String(nextId).padStart(3, '0')}`; // PAT001, PAT002, etc.
      
      const docRef = await addDoc(patientsCollection, {
        patientId: patientId,
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        category: patient.category,
        phoneNumber: patient.phoneNumber,
        lastVisitDate: patient.lastVisitDate || 'Never',
        status: patient.status || 'Active',
        isPregnant: patient.isPregnant || false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      await this.loadPatients(); // Refresh the list
      return docRef.id;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patient: Partial<PatientList>): Promise<void> {
    try {
      const patientDoc = doc(this.firestore, 'patients', id);
      await updateDoc(patientDoc, {
        ...patient,
        updatedAt: Timestamp.now()
      });
      
      await this.loadPatients(); // Refresh the list
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<void> {
    try {
      const patientDoc = doc(this.firestore, 'patients', id);
      await deleteDoc(patientDoc);
      
      await this.loadPatients(); // Refresh the list
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  getPatients(): PatientList[] {
    return this.patientsSubject.value;
  }

  searchPatients(searchTerm: string): PatientList[] {
    const patients = this.patientsSubject.value;
    if (!searchTerm || searchTerm.trim() === '') {
      return patients;
    }

    const term = searchTerm.toLowerCase().trim();
    return patients.filter(patient => 
      patient.fullName.toLowerCase().includes(term) ||
      patient.patientId.toLowerCase().includes(term) ||
      patient.phoneNumber.toLowerCase().includes(term)
    );
  }

  filterPatients(filters: {
    category?: string;
    gender?: string;
    status?: string;
    searchTerm?: string;
  }): PatientList[] {
    let patients = this.patientsSubject.value;

    // Apply search
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      patients = this.searchPatients(filters.searchTerm);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All Categories') {
      patients = patients.filter(p => p.category === filters.category);
    }

    // Apply gender filter
    if (filters.gender && filters.gender !== 'All Genders') {
      patients = patients.filter(p => p.gender === filters.gender);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'All Status') {
      patients = patients.filter(p => p.status === filters.status);
    }

    return patients;
  }

  getStatistics() {
    const patients = this.patientsSubject.value;
    return {
      total: patients.length,
      pregnant: patients.filter(p => p.isPregnant).length,
      active: patients.filter(p => p.status === 'Active').length
    };
  }
}
