import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Patient } from '../../models/patient.interface';
import { SampleDataService } from '../../services/sample-data.service';
import { SideBar } from '../../../core/side-bar/side-bar';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.html',
  styleUrls: ['./patient-profile.css'],
  standalone: true,
  imports: [CommonModule, SideBar, RouterLink]
})
export class PatientProfileComponent implements OnInit {
  patient: Patient | null = null;
  loading: boolean = false;
  error: string | null = null;
  
  // Tab management
  activeTab: string = 'overview';
  
  // Available tabs
  tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'medical-history', label: 'Medical History', icon: '📋' },
    { id: 'visits', label: 'Visits', icon: '📅' },
    { id: 'documents', label: 'Documents', icon: '📎' }
  ];

  // Pregnancy tab (only for pregnant mothers)
  pregnancyTab = { id: 'pregnancy', label: 'Pregnancy Care', icon: '🤰' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sampleDataService: SampleDataService
  ) {}

  ngOnInit(): void {
    this.loadPatient();
  }

   loadPatient(): void {
    this.loading = true;
    this.error = null;
    const patientId = this.route.snapshot.paramMap.get('id');

    if (!patientId) {
      this.error = 'Patient ID not provided';
      this.loading = false;
      return;
    }

    // Simulate API call
    setTimeout(() => {
      try {
        const patient = this.sampleDataService.getSampleFullPatient(patientId);
        if (patient) {
          this.patient = patient;
          
          // Add pregnancy tab if patient is pregnant
          if (this.isPregnantPatient) {
            this.tabs.push(this.pregnancyTab);
          }
        } else {
          this.error = 'Patient not found';
        }
      } catch (err) {
        this.error = 'Error loading patient data';
        console.error('Error loading patient:', err);
      } finally {
        this.loading = false;
      }
    }, 1000);
  }

  // Check if patient is pregnant
  get isPregnantPatient(): boolean {
    return this.patient?.pregnancyDetails?.isPregnant || false;
  }

  // Change active tab
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // Navigate back to patient list
  navigateToPatientList(): void {
    this.router.navigate(['/patients']);
  }

  // Navigate to edit patient
  navigateToEdit(): void {
    if (this.patient) {
      this.router.navigate(['/patients/edit', this.patient.id]);
    }
  }

  getBreadcrumbItems(): { label: string, route?: string }[] {
    return [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Patient Management', route: '/patients' },
      { label: this.patient ? `${this.patient.personalInfo.fullName} - Profile` : 'Patient Profile' }
    ];
  }

  getInitials(fullName: string | undefined): string {
  if (!fullName) return 'P'; // Return 'P' for Patient as fallback
  
  const names = fullName.split(' ');
  const initials = names.map(name => name.charAt(0)).join('');
  return initials.toUpperCase() || 'P';
}

}