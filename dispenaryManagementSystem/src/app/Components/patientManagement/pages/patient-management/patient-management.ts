import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientListComponent } from '../../components/patient-list/patient-list';
import { SideBar } from '../../../core/side-bar/side-bar';
import { PatientList, PatientFilter } from '../../models/patient.interface';
import { PatientService } from '../../services/patient.service';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { MedicineService, Medicine } from '../../../../services/medicine.service';

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  status: Medicine['status'];
  quantity: number;
}

@Component({
  selector: 'app-patient-management-page',
  templateUrl: './patient-management.html',
  styleUrls: ['./patient-management.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PatientListComponent, SideBar, MatIconModule]
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

  // Prescription modal state
  showPrescriptionModal: boolean = false;
  prescriptionPatientName: string = '';
  prescriptionPatientMobile: string = '';
  medicineSearchTerm: string = '';
  filteredMedicines: Medicine[] = [];
  selectedPrescriptionItems: PrescriptionItem[] = [];
  medicineQuantityMap: { [key: string]: number } = {};
  savingPrescription: boolean = false;

  private patientsSubscription?: Subscription;
  private medicinesSubscription?: Subscription;

  constructor(
    private router: Router,
    private patientService: PatientService,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadMedicines();
  }

  ngOnDestroy(): void {
    if (this.patientsSubscription) {
      this.patientsSubscription.unsubscribe();
    }
    if (this.medicinesSubscription) {
      this.medicinesSubscription.unsubscribe();
    }
  }

  private loadMedicines(): void {
    this.medicinesSubscription = this.medicineService.medicines$.subscribe((medicines) => {
      this.filteredMedicines = medicines;
    });
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

  openPrescriptionModal(): void {
    this.showPrescriptionModal = true;
    this.prescriptionPatientName = '';
    this.prescriptionPatientMobile = '';
    this.medicineSearchTerm = '';
    this.selectedPrescriptionItems = [];
    this.medicineQuantityMap = {};
    this.filteredMedicines = this.medicineService.getMedicines();
  }

  closePrescriptionModal(): void {
    this.showPrescriptionModal = false;
  }

  searchMedicinesForPrescription(): void {
    const term = this.medicineSearchTerm.trim();
    if (!term) {
      this.filteredMedicines = this.medicineService.getMedicines();
      return;
    }

    this.filteredMedicines = this.medicineService.searchMedicines(term);
    if (this.filteredMedicines.length === 0) {
      alert('No matching drugs found. Try a different name or id.');
    }
  }

  addMedicineToPrescription(medicine: Medicine): void {
    const requestedQty = Number(this.medicineQuantityMap[medicine.id || ''] || 0);
    if (!medicine.id) {
      alert('Medicine id not found. Please refresh and try again.');
      return;
    }

    if (requestedQty <= 0) {
      alert('Please enter a valid quantity greater than 0.');
      return;
    }

    const existingItem = this.selectedPrescriptionItems.find((item) => item.medicineId === medicine.id);
    if (existingItem) {
      existingItem.quantity = requestedQty;
      existingItem.status = medicine.status;
      return;
    }

    this.selectedPrescriptionItems.push({
      medicineId: medicine.id,
      medicineName: medicine.medicineName,
      status: medicine.status,
      quantity: requestedQty
    });
  }

  removePrescriptionItem(medicineId: string): void {
    this.selectedPrescriptionItems = this.selectedPrescriptionItems.filter((item) => item.medicineId !== medicineId);
  }

  async completePrescription(): Promise<void> {
    const patientName = (this.prescriptionPatientName || '').trim().toLowerCase();
    const patientMobile = (this.prescriptionPatientMobile || '').replace(/\D/g, '');

    if (!patientName || !patientMobile) {
      alert('Patient name and mobile number are required.');
      return;
    }

    if (patientMobile.length < 9) {
      alert('Enter a valid mobile number.');
      return;
    }

    if (this.selectedPrescriptionItems.length === 0) {
      alert('Please add at least one medicine with quantity.');
      return;
    }

    const matchedPatient = this.patients.find((patient) => {
      const listName = (patient.fullName || '').trim().toLowerCase();
      const listMobile = (patient.phoneNumber || '').replace(/\D/g, '');
      return listName === patientName && listMobile === patientMobile;
    });

    if (!matchedPatient || !matchedPatient.id) {
      alert('Patient not found. Enter exact patient name and mobile number.');
      return;
    }

    this.savingPrescription = true;
    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      await this.patientService.updatePatient(matchedPatient.id, {
        lastVisitDate: formattedDate
      });

      alert('Prescription completed and patient last visit updated.');
      this.closePrescriptionModal();
    } catch (error) {
      console.error('Error completing prescription:', error);
      alert('Failed to complete prescription. Please try again.');
    } finally {
      this.savingPrescription = false;
    }
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
