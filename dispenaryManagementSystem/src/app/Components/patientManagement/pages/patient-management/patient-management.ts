import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PatientListComponent } from '../../components/patient-list/patient-list';
import { SideBar } from '../../../core/side-bar/side-bar';
import { PatientList, PatientFilter } from '../../models/patient.interface';
import { PatientService } from '../../services/patient.service';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-management-page',
  templateUrl: './patient-management.html',
  styleUrls: ['./patient-management.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, PatientListComponent, SideBar, MatIconModule]
})
export class PatientManagementPageComponent implements OnInit, OnDestroy {
  patients: PatientList[] = [];
  filteredPatients: PatientList[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Stats for dashboard
  totalPatients: number = 0;
  pregnantPatients: number = 0;
  activePatients: number = 0;

  private patientsSubscription?: Subscription;

  constructor(
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  ngOnDestroy(): void {
    if (this.patientsSubscription) {
      this.patientsSubscription.unsubscribe();
    }
  }

  private loadPatients(): void {
    this.loading = true;
    this.error = null;

    this.patientsSubscription = this.patientService.patients$.subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = patients;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load patients';
        console.error('Error loading patients:', err);
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    const stats = this.patientService.getStatistics();
    this.totalPatients = stats.total;
    this.pregnantPatients = stats.pregnant;
    this.activePatients = stats.active;
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

  async onPatientDelete(patientId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this patient?')) {
      try {
        this.loading = true;
        await this.patientService.deletePatient(patientId);
        alert('Patient deleted successfully!');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
      } finally {
        this.loading = false;
      }
    }
  }

  onFiltersChanged(filters: PatientFilter): void {
    console.log('Filters applied:', filters);
    this.filteredPatients = this.patientService.filterPatients({
      category: filters.category,
      gender: filters.gender,
      status: filters.status,
      searchTerm: filters.searchTerm
    });
  }

  navigateToAddPatient(): void {
    this.router.navigate(['/add-patient']);
  }

  async refreshPatients(): Promise<void> {
    try {
      this.loading = true;
      await this.patientService.loadPatients();
    } catch (error) {
      console.error('Error refreshing patients:', error);
      this.error = 'Failed to refresh patients';
    } finally {
      this.loading = false;
    }
  }
}
