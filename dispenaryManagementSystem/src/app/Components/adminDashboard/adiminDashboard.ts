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
  id?: string;
  title: string;
  description: string;
  username?: string;
  email?: string;
  count?: number;
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
      count: 0
    },
    {
      title: 'Doctor',
      description: 'Access to patient records',
      count: 0
    },
    {
      title: 'Manager',
      description: 'Manage staff and operations',
      count: 0
    }
  ];

  // Modal state
  showUserModal: boolean = false;
  showPermissionsModal: boolean = false;
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
    const roleCounts: { [key: string]: number } = {
      'Administrator': 0,
      'Doctor': 0,
      'Manager': 0
    };

    this.systemUsers.forEach(user => {
      if (roleCounts[user.role] !== undefined) {
        roleCounts[user.role] += 1;
      }
    });

    // Keep this section compact with one card per role.
    this.userRoles = Object.keys(roleCounts).map((role) => ({
      title: role,
      description: this.getRoleDescription(role),
      count: roleCounts[role]
    }));
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
      id: role.id,
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

  openPermissionsModal(): void {
    this.showPermissionsModal = true;
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
  }

  async removePermissionUser(user: SystemUser): Promise<void> {
    if (!user.id) {
      alert('❌ Error: User id not found');
      return;
    }

    const confirmed = confirm(`Remove ${user.fullName} (${user.role}) from user permissions list?`);
    if (!confirmed) {
      return;
    }

    const result = await this.userManagementService.deleteUser(user.id);
    if (result.success) {
      alert('✅ User removed from permissions list.');
    } else {
      alert(`❌ Error removing user:\n\n${result.error}`);
    }
  }

  getPermissionText(role: SystemUser['role']): string {
    const map: Record<SystemUser['role'], string> = {
      Administrator: 'Full system control',
      Doctor: 'Patient and medical access',
      Manager: 'Operations and reports'
    };
    return map[role];
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
          const loginInstructions = `✅ Account Created Successfully!

👤 Name: ${this.currentUser.fullName}
📧 Email: ${this.currentUser.email}
🔑 Password: ${this.currentUser.password}
👔 Job Role: ${this.currentUser.role}

✓ Saved to database
✓ Login details prepared
✓ Email sent to user

The user can now log in with the email and password sent by the admin.`;
          
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
        saveButton.textContent = this.isEditMode ? 'Update User' : 'Create Account';
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
