import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../patientManagement/services/patient.service';
import { PatientList } from '../patientManagement/models/patient.interface';
import { UserManagementService, SystemUser } from '../../services/user-management.service';

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
  username?: string;
  email?: string;
}

interface User {
  id?: string;
  username: string;
  email: string;
  password: string;
  role: string;
  fullName: string;
  createdAt?: Date;
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
      description: 'Full access to all features',
      username: 'admin',
      email: 'admin@clinic.com'
    },
    {
      title: 'Doctor',
      description: 'Access to patient records',
      username: 'doctor1',
      email: 'doctor@clinic.com'
    },
    {
      title: 'Manager',
      description: 'Manage staff and operations',
      username: 'manager',
      email: 'manager@clinic.com'
    }
  ];

  // Modal state
  showUserModal: boolean = false;
  isEditMode: boolean = false;
  currentUser: User = this.getEmptyUser();
  selectedRoleIndex: number = -1;
  systemUsers: SystemUser[] = [];

  constructor(
    private patientService: PatientService,
    private userManagementService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.loadPatientsData();
    this.loadSystemUsers();
  }

  loadSystemUsers(): void {
    this.userManagementService.users$.subscribe((users) => {
      this.systemUsers = users;
      // Update userRoles display based on actual users
      this.updateUserRolesDisplay();
    });
  }

  updateUserRolesDisplay(): void {
    // Group users by role
    const roleGroups: { [key: string]: SystemUser[] } = {
      'Administrator': [],
      'Doctor': [],
      'Manager': []
    };

    this.systemUsers.forEach(user => {
      if (roleGroups[user.role]) {
        roleGroups[user.role].push(user);
      }
    });

    // Update userRoles array with actual user data
    this.userRoles = [];
    Object.keys(roleGroups).forEach(role => {
      if (roleGroups[role].length > 0) {
        roleGroups[role].forEach(user => {
          this.userRoles.push({
            title: user.role,
            description: this.getRoleDescription(user.role),
            username: user.username,
            email: user.email
          });
        });
      } else {
        // Show placeholder if no users in role
        this.userRoles.push({
          title: role,
          description: this.getRoleDescription(role)
        });
      }
    });
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
    this.isEditMode = true;
    this.selectedRoleIndex = this.userRoles.indexOf(role);
    this.currentUser = {
      username: role.username || '',
      email: role.email || '',
      password: '',
      role: role.title,
      fullName: role.username || ''
    };
    this.showUserModal = true;
  }

  addNewRole(): void {
    this.isEditMode = false;
    this.currentUser = this.getEmptyUser();
    this.showUserModal = true;
  }

  getEmptyUser(): User {
    return {
      username: '',
      email: '',
      password: '',
      role: '',
      fullName: ''
    };
  }

  closeModal(): void {
    this.showUserModal = false;
    this.currentUser = this.getEmptyUser();
    this.selectedRoleIndex = -1;
  }

  async saveUser(): Promise<void> {
    // Validate form
    if (!this.currentUser.username || !this.currentUser.email || !this.currentUser.role || !this.currentUser.fullName) {
      alert('❌ Error: Please fill in all required fields');
      return;
    }

    if (!this.isEditMode && !this.currentUser.password) {
      alert('❌ Error: Password is required for new users');
      return;
    }

    // Show loading state
    const saveButton = document.querySelector('.btn-save') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = 'Saving...';
    }

    try {
      if (this.isEditMode && this.selectedRoleIndex >= 0) {
        // Update existing user
        const userId = this.currentUser.id;
        if (userId) {
          const result = await this.userManagementService.updateUser(userId, {
            username: this.currentUser.username,
            email: this.currentUser.email,
            role: this.currentUser.role as 'Administrator' | 'Doctor' | 'Manager',
            fullName: this.currentUser.fullName
          });
          
          if (result.success) {
            alert(`✅ Success!\n\nUser "${this.currentUser.username}" has been updated successfully!`);
            this.closeModal();
          } else {
            alert(`❌ Error updating user:\n\n${result.error}`);
          }
        }
      } else {
        // Create new user
        const result = await this.userManagementService.createUser({
          username: this.currentUser.username,
          email: this.currentUser.email,
          role: this.currentUser.role as 'Administrator' | 'Doctor' | 'Manager',
          fullName: this.currentUser.fullName
        }, this.currentUser.password);
        
        if (result.success) {
          const loginInstructions = `✅ User Created Successfully!

👤 Name: ${this.currentUser.fullName}
📧 Email: ${this.currentUser.email}
🔑 Password: ${this.currentUser.password}
👔 Role: ${this.currentUser.role}

✓ Saved to database
✓ User can now login

The user can login and will be routed to their dashboard.`;
          
          alert(loginInstructions);
          this.closeModal();
        } else {
          alert(`❌ Error Creating User:\n\n${result.error}\n\nUser was NOT saved to database.`);
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(`❌ Unexpected Error:\n\n${error.message || 'Failed to save user'}\n\nUser was NOT saved to database.`);
    } finally {
      // Restore button state
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = this.isEditMode ? 'Update User' : 'Create User';
      }
    }
  }

  getRoleDescription(role: string): string {
    const descriptions: { [key: string]: string } = {
      'Administrator': 'Full access to all features',
      'Doctor': 'Access to patient records',
      'Manager': 'Manage staff and operations'
    };
    return descriptions[role] || 'Custom role';
  }

  contactSupport(): void {
    console.log('Contact support');
    // Implement contact support logic
  }
}
