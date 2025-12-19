import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../patientManagement/services/patient.service';
import { PatientList } from '../patientManagement/models/patient.interface';

interface PatientRecord {
  name: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

interface Notification {
  type: 'success' | 'info' | 'warning';
  message: string;
  time: string;
  icon: string;
}

interface UserRole {
  title: string;
  description: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './adminDashboard.html',
  styleUrls: ['./adminDashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  searchQuery: string = '';
  
  // Dashboard stats
  patientVisits = 0;
  prescriptions = 876;
  inventoryStatus = 'LOW STOCK';

  // Patient records
  patientRecords: PatientRecord[] = [];
  allPatients: PatientList[] = [];

  // Notifications
  notifications: Notification[] = [
    {
      type: 'success',
      message: 'Weekly report sent successfully.',
      time: '1 hour ago',
      icon: 'check_circle'
    },
    {
      type: 'info',
      message: 'Appointment reminders sent.',
      time: '3 hour ago',
      icon: 'event'
    },
    {
      type: 'warning',
      message: 'Password change for Dr. Indika',
      time: 'Yesterday',
      icon: 'warning'
    }
  ];

  // User roles
  userRoles: UserRole[] = [
    {
      title: 'Administrator',
      description: 'Full access to all features'
    },
    {
      title: 'Doctor',
      description: 'Access to patient records'
    },
    {
      title: 'Receptionist',
      description: 'Manage appointments'
    }
  ];

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatientsData();
  }

  loadPatientsData(): void {
    this.patientService.patients$.subscribe({
      next: (patients: PatientList[]) => {
        console.log('Admin Dashboard - Loaded patients:', patients);
        this.allPatients = patients;
        this.patientRecords = this.convertToPatientRecords(patients);
        this.patientVisits = patients.length;
        console.log('Admin Dashboard - Patient records:', this.patientRecords);
      },
      error: (error) => {
        console.error('Error loading patients in admin dashboard:', error);
      }
    });
  }

  convertToPatientRecords(patients: PatientList[]): PatientRecord[] {
    return patients.map(patient => {
      let lastVisit = 'Never';
      if (patient.lastVisitDate) {
        if (typeof patient.lastVisitDate === 'string') {
          lastVisit = patient.lastVisitDate;
        } else if (patient.lastVisitDate instanceof Date) {
          lastVisit = patient.lastVisitDate.toLocaleDateString();
        }
      }

      return {
        name: patient.fullName,
        dateOfBirth: this.calculateDateOfBirth(patient.age),
        age: patient.age,
        gender: patient.gender,
        lastVisit: lastVisit,
        status: patient.status.toLowerCase() === 'active' ? 'active' : 'inactive'
      };
    });
  }

  calculateDateOfBirth(age: number): string {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    return `01-01-${birthYear}`;
  }

  searchPatients(): void {
    const query = this.searchQuery.trim().toLowerCase();
    
    if (!query) {
      // If search is empty, show all patients
      this.patientRecords = this.convertToPatientRecords(this.allPatients);
      console.log('Showing all patients:', this.patientRecords.length);
      return;
    }

    // Filter patients based on search query
    const filtered = this.allPatients.filter(patient => {
      const nameMatch = patient.fullName.toLowerCase().includes(query);
      const idMatch = patient.patientId.toLowerCase().includes(query);
      const phoneMatch = patient.phoneNumber?.includes(query) || false;
      
      return nameMatch || idMatch || phoneMatch;
    });
    
    console.log(`Search for "${this.searchQuery}": Found ${filtered.length} patients`);
    this.patientRecords = this.convertToPatientRecords(filtered);
  }

  viewPatient(patient: PatientRecord): void {
    console.log('View patient:', patient.name);
    // Find the full patient data
    const fullPatient = this.allPatients.find(p => p.fullName === patient.name);
    if (fullPatient) {
      // You can navigate to patient details page or show a modal
      console.log('Full patient data:', fullPatient);
    }
  }

  editRole(role: UserRole): void {
    console.log('Edit role:', role.title);
    // Implement edit role logic
  }

  addNewRole(): void {
    console.log('Add new role');
    // Implement add role logic
  }

  contactSupport(): void {
    console.log('Contact support');
    // Implement contact support logic
  }
}
