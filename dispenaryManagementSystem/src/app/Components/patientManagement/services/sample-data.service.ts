import { Injectable } from '@angular/core';
import { Patient, PatientList, CreatePatientRequest } from '../models/patient.interface';
import { PatientStatus, PatientCategory, PatientGender } from '../constants/patients.constants';

@Injectable({
  providedIn: 'root'
})
export class SampleDataService {

  getSamplePatients(): PatientList[] {
    return [
      {
        id: '1',
        patientId: 'PAT001',
        fullName: 'Arunan Kumara',
        age: 39,
        gender: PatientGender.MALE,
        category: PatientCategory.ESTATE_WORKER,
        phoneNumber: '0776767676',
        lastVisitDate: new Date('2025-10-23'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      },
      {
        id: '2',
        patientId: 'PAT002',
        fullName: 'Nirusha Sivakumar',
        age: 26,
        gender: PatientGender.FEMALE,
        category: PatientCategory.PREGNANT_MOTHER,
        phoneNumber: '0771234567',
        lastVisitDate: new Date('2025-10-23'),
        status: PatientStatus.ACTIVE,
        isPregnant: true
      },
      {
        id: '3',
        patientId: 'PAT003',
        fullName: 'Ruwan Perera',
        age: 37,
        gender: PatientGender.MALE,
        category: PatientCategory.ESTATE_WORKER,
        phoneNumber: '0772345678',
        lastVisitDate: new Date('2025-10-22'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      },
      {
        id: '4',
        patientId: 'PAT004',
        fullName: 'Dilini Silva',
        age: 25,
        gender: PatientGender.FEMALE,
        category: PatientCategory.FAMILY_MEMBER,
        phoneNumber: '0773456789',
        lastVisitDate: new Date('2025-10-21'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      },
      {
        id: '5',
        patientId: 'PAT005',
        fullName: 'Chamari Perera',
        age: 25,
        gender: PatientGender.FEMALE,
        category: PatientCategory.PREGNANT_MOTHER,
        phoneNumber: '0774567890',
        lastVisitDate: new Date('2025-10-20'),
        status: PatientStatus.ACTIVE,
        isPregnant: true
      },
      {
        id: '6',
        patientId: 'PAT006',
        fullName: 'S. Kumarasingha',
        age: 59,
        gender: PatientGender.MALE,
        category: PatientCategory.ESTATE_WORKER,
        phoneNumber: '0775678901',
        lastVisitDate: new Date('2025-10-19'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      },
      {
        id: '7',
        patientId: 'PAT007',
        fullName: 'Kamala Ranasinghe',
        age: 32,
        gender: PatientGender.FEMALE,
        category: PatientCategory.PREGNANT_MOTHER,
        phoneNumber: '0776789012',
        lastVisitDate: new Date('2025-10-18'),
        status: PatientStatus.ACTIVE,
        isPregnant: true
      },
      {
        id: '8',
        patientId: 'PAT008',
        fullName: 'Rohitha Bandara',
        age: 45,
        gender: PatientGender.MALE,
        category: PatientCategory.ESTATE_WORKER,
        phoneNumber: '0777890123',
        lastVisitDate: new Date('2025-10-17'),
        status: PatientStatus.INACTIVE,
        isPregnant: false
      },
      {
        id: '9',
        patientId: 'PAT009',
        fullName: 'Nadeesha Wickramasinghe',
        age: 28,
        gender: PatientGender.FEMALE,
        category: PatientCategory.FAMILY_MEMBER,
        phoneNumber: '0778901234',
        lastVisitDate: new Date('2025-10-16'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      },
      {
        id: '10',
        patientId: 'PAT010',
        fullName: 'Sunil Fernando',
        age: 52,
        gender: PatientGender.MALE,
        category: PatientCategory.ESTATE_WORKER,
        phoneNumber: '0779012345',
        lastVisitDate: new Date('2025-10-15'),
        status: PatientStatus.ACTIVE,
        isPregnant: false
      }
    ];
  }

  getSampleFullPatient(id: string): Patient | null {
    const samplePatients = this.getSampleFullPatients();
    return samplePatients.find(patient => patient.id === id) || null;
  }

  private getSampleFullPatients(): Patient[] {
    return [
      this.createFullPatient('1', 'PAT001', 'Arunan Kumara', 39, PatientGender.MALE, PatientCategory.ESTATE_WORKER, '0776767676', false),
      this.createFullPatient('2', 'PAT002', 'Nirusha Sivakumar', 26, PatientGender.FEMALE, PatientCategory.PREGNANT_MOTHER, '0771234567', true),
      this.createFullPatient('3', 'PAT003', 'Ruwan Perera', 37, PatientGender.MALE, PatientCategory.ESTATE_WORKER, '0772345678', false),
      this.createFullPatient('4', 'PAT004', 'Dilini Silva', 25, PatientGender.FEMALE, PatientCategory.FAMILY_MEMBER, '0773456789', false),
      this.createFullPatient('5', 'PAT005', 'Chamari Perera', 25, PatientGender.FEMALE, PatientCategory.PREGNANT_MOTHER, '0774567890', true),
      this.createFullPatient('6', 'PAT006', 'S. Kumarasingha', 59, PatientGender.MALE, PatientCategory.ESTATE_WORKER, '0775678901', false),
      this.createFullPatient('7', 'PAT007', 'Kamala Ranasinghe', 32, PatientGender.FEMALE, PatientCategory.PREGNANT_MOTHER, '0776789012', true),
      this.createFullPatient('8', 'PAT008', 'Rohitha Bandara', 45, PatientGender.MALE, PatientCategory.ESTATE_WORKER, '0777890123', false),
      this.createFullPatient('9', 'PAT009', 'Nadeesha Wickramasinghe', 28, PatientGender.FEMALE, PatientCategory.FAMILY_MEMBER, '0778901234', false),
      this.createFullPatient('10', 'PAT010', 'Sunil Fernando', 52, PatientGender.MALE, PatientCategory.ESTATE_WORKER, '0779012345', false)
    ];
  }

  private createFullPatient(
    id: string, 
    patientId: string, 
    fullName: string, 
    age: number, 
    gender: 'Male' | 'Female' | 'Other', 
    category: 'Pregnant Mother' | 'Estate Worker' | 'Family Member' | 'Other',
    phoneNumber: string,
    isPregnant: boolean
  ): Patient {
    const now = new Date();
    const createdAt = new Date('2024-01-01');
    
    return {
      id,
      patientId,
      personalInfo: {
        fullName,
        age,
        dateOfBirth: this.calculateDateOfBirth(age),
        gender,
        phoneNumber,
        address: this.generateAddress(fullName),
        emergencyContact: 'Family Member',
        emergencyPhone: '0770000000'
      },
      category,
      pregnancyDetails: isPregnant ? {
        isPregnant: true,
        lmpDate: new Date('2025-01-15'),
        edd: new Date('2025-10-22'),
        pregnancyWeek: 38,
        highRisk: false,
        notes: 'Regular checkups'
      } : {
        isPregnant: false,
        lmpDate: undefined,
        edd: undefined,
        pregnancyWeek: undefined,
        highRisk: false,
        notes: ''
      },
      medicalInfo: {
        bloodGroup: this.getRandomBloodGroup(),
        allergies: ['None'],
        chronicConditions: ['Hypertension'],
        currentMedications: ['Blood pressure medication'],
        medicalHistory: 'Regular patient with no major issues',
        notes: 'Compliant with medication'
      },
      status: PatientStatus.ACTIVE,
      createdAt,
      updatedAt: now,
      createdBy: 'system',
      lastVisitDate: new Date()
    };
  }

  private calculateDateOfBirth(age: number): Date {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return new Date(birthYear, 5, 15);
  }

  private generateAddress(name: string): string {
    const estates = ['Hugoland Tea Estate', 'Walmada Division', 'Estate West', 'Estate East'];
    const randomEstate = estates[Math.floor(Math.random() * estates.length)];
    return `24/2 ${randomEstate}, Belihuloya`;
  }

  private getRandomBloodGroup(): string {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
  }
}