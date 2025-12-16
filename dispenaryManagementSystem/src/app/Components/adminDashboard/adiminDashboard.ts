import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  patientVisits = 1204;
  prescriptions = 876;
  inventoryStatus = 'LOW STOCK';

  // Patient records
  patientRecords: PatientRecord[] = [
    {
      name: 'Arunan Kumara',
      dateOfBirth: '10-07-1986',
      age: 39,
      gender: 'Male',
      lastVisit: '23-10-2025',
      status: 'active'
    },
    {
      name: 'Nirusha Sivakumar',
      dateOfBirth: '11-08-1999',
      age: 26,
      gender: 'Female',
      lastVisit: '23-10-2025',
      status: 'inactive'
    },
    {
      name: 'Ruwan Perera',
      dateOfBirth: '12-09-1988',
      age: 37,
      gender: 'Male',
      lastVisit: '23-10-2025',
      status: 'active'
    },
    {
      name: 'Dilini Silva',
      dateOfBirth: '10-07-2000',
      age: 25,
      gender: 'Female',
      lastVisit: '23-10-2025',
      status: 'active'
    }
  ];

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

  constructor() {}

  ngOnInit(): void {}

  searchPatients(): void {
    console.log('Searching for:', this.searchQuery);
    // Implement search logic
  }

  viewPatient(patient: PatientRecord): void {
    console.log('View patient:', patient.name);
    // Implement view patient logic
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
