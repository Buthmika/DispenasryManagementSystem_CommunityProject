import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PatientListComponent } from '../../components/patient-list/patient-list';
import { SideBar } from '../../../core/side-bar/side-bar';
import { PatientList, PatientFilter } from '../../models/patient.interface';
import { SampleDataService } from '../../services/sample-data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-management-page',
  templateUrl: './patient-management.html',
  styleUrls: ['./patient-management.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, PatientListComponent, SideBar, MatIconModule]
})
export class PatientManagementPageComponent implements OnInit {
  patients: PatientList[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Stats for dashboard
  totalPatients: number = 0;
  pregnantPatients: number = 0;
  activePatients: number = 0;

  constructor(
    private router: Router,
    private sampleDataService: SampleDataService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.loading = true;
    this.error = null;

    // Simulate API call
    setTimeout(() => {
      try {
        this.patients = this.sampleDataService.getSamplePatients();
        this.calculateStats();
      } catch (err) {
        this.error = 'Failed to load patients';
        console.error('Error loading patients:', err);
      } finally {
        this.loading = false;
      }
    }, 1000);
  }

  private calculateStats(): void {
    this.totalPatients = this.patients.length;
    this.pregnantPatients = this.patients.filter(p => p.isPregnant).length;
    this.activePatients = this.patients.filter(p => p.status === 'Active').length;
  }

  onPatientSelected(patientId: string): void {
    console.log('Patient selected:', patientId);
    // Navigate to patient profile/details page
    this.router.navigate(['/patients/profile', patientId]);
  }

  onPatientEdit(patientId: string): void {
    console.log('Edit patient:', patientId);
    this.router.navigate(['/patients/edit', patientId]);
  }

  onPatientDelete(patientId: string): void {
    console.log('Delete patient:', patientId);
    // In a real app, you would call a service to delete the patient
    // For now, we'll just remove from the local array
    this.patients = this.patients.filter(p => p.id !== patientId);
    this.calculateStats();
    alert(`Patient ${patientId} deleted successfully!`);
  }

  onFiltersChanged(filters: PatientFilter): void {
    console.log('Filters applied:', filters);
    // In a real app, you would call a service with the filters
    // For now, we'll just log them
  }

  navigateToAddPatient(): void {
    this.router.navigate(['/patients/add']);
  }

  refreshPatients(): void {
    this.loadPatients();
  }
}
