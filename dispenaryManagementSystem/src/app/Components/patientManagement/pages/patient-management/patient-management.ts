import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientListComponent } from '../../components/patient-list/patient-list';
import { SideBar } from '../../../core/side-bar/side-bar';
import { PatientList, PatientFilter, PrescriptionEntry } from '../../models/patient.interface';
import { PatientService } from '../../services/patient.service';
import { MedicineService, Medicine } from '../../../../services/medicine.service';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-management-page',
  templateUrl: './patient-management.html',
  styleUrls: ['./patient-management.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, PatientListComponent, SideBar]
})
export class PatientManagementPageComponent implements OnInit, OnDestroy {
  patients: PatientList[] = [];
  filteredPatients: PatientList[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  // Prescription modal state
  showPrescriptionModal: boolean = false;
  prescriptionPatientSearch: string = '';
  patientSearchResults: PatientList[] = [];
  selectedPatientId: string = '';
  selectedPatientName: string = '';
  selectedPatientPhone: string = '';
  medicineSearchTerm: string = '';
  availableMedicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  selectedPrescriptionItems: Array<{ medicineId: string; medicineName: string; status: Medicine['status']; quantity: number }> = [];
  savingPrescription: boolean = false;

  showHistoryModal: boolean = false;
  selectedHistoryPatientName: string = '';
  selectedHistoryPatient: PatientList | null = null;
  historyEntries: PrescriptionEntry[] = [];
  historyLoading: boolean = false;
  historyError: string | null = null;

  // Stats for dashboard
  totalPatients: number = 0;
  pregnantPatients: number = 0;
  activePatients: number = 0;

  private patientsSubscription?: Subscription;

  constructor(
    private router: Router,
    private patientService: PatientService,
    private medicineService: MedicineService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadMedicines();
  }

  ngOnDestroy(): void {
    if (this.patientsSubscription) {
      this.patientsSubscription.unsubscribe();
    }
  }

  private loadMedicines(): void {
    this.medicineService.medicines$.subscribe((medicines) => {
      this.availableMedicines = medicines;
      this.filteredMedicines = medicines;
    });
  }

  private loadPatients(): void {
    this.loading = true;
    this.error = null;

    this.patientsSubscription = this.patientService.patients$.subscribe({
      next: (patients) => {
        this.patients = patients;
        this.patientSearchResults = patients;
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
    const selected = this.patients.find((patient) => patient.id === patientId);
    if (selected) {
      this.openPatientHistory(selected);
    }
  }

  openPatientHistory(patient: PatientList): void {
    this.selectedHistoryPatient = patient;
    this.selectedHistoryPatientName = `${patient.patientId} — ${patient.fullName}`;
    this.showHistoryModal = true;
    this.historyLoading = true;
    this.historyError = null;
    this.historyEntries = [];

    this.patientService.getPrescriptionHistory(patient.id)
      .then((entries) => {
        this.historyEntries = entries;
      })
      .catch((error: any) => {
        console.error('Error loading history:', error);
        this.historyEntries = [];
        this.historyError = error?.message || error?.code || 'Unable to load prescription history.';
      })
      .finally(() => {
        this.historyLoading = false;
      });
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
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
    this.prescriptionPatientSearch = '';
    this.patientSearchResults = this.patients;
    this.selectedPatientId = '';
    this.selectedPatientName = '';
    this.selectedPatientPhone = '';
    this.medicineSearchTerm = '';
    this.filteredMedicines = this.availableMedicines;
    this.selectedPrescriptionItems = [];
  }

  closePrescriptionModal(): void {
    this.showPrescriptionModal = false;
  }

  filterPatientOptions(): void {
    const term = this.prescriptionPatientSearch.trim().toLowerCase();
    if (!term) {
      this.patientSearchResults = this.patients;
      return;
    }

    this.patientSearchResults = this.patients.filter((patient) =>
      patient.fullName.toLowerCase().includes(term) ||
      patient.patientId.toLowerCase().includes(term) ||
      patient.phoneNumber.toLowerCase().includes(term)
    );
  }

  selectPrescriptionPatient(patient: PatientList): void {
    this.selectedPatientId = patient.id || '';
    this.selectedPatientName = patient.fullName;
    this.selectedPatientPhone = patient.phoneNumber;
    this.prescriptionPatientSearch = `${patient.patientId} — ${patient.fullName}`;
    this.patientSearchResults = [];
  }

  searchMedicinesForPrescription(): void {
    const term = this.medicineSearchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredMedicines = this.availableMedicines;
      return;
    }

    this.filteredMedicines = this.availableMedicines.filter((medicine) =>
      medicine.medicineName.toLowerCase().includes(term) ||
      medicine.medicineId.toLowerCase().includes(term) ||
      (medicine.batchNumber || '').toLowerCase().includes(term)
    );
  }

  addMedicineToPrescription(medicine: Medicine, quantity: number): void {
    if (!medicine.id) {
      return;
    }

    if (quantity <= 0) {
      alert('Please choose a valid quantity greater than 0.');
      return;
    }

    const existingItem = this.selectedPrescriptionItems.find((item) => item.medicineId === medicine.id);
    if (existingItem) {
      existingItem.quantity = quantity;
      return;
    }

    this.selectedPrescriptionItems.push({
      medicineId: medicine.id,
      medicineName: medicine.medicineName,
      status: medicine.status,
      quantity
    });
  }

  removePrescriptionItem(medicineId: string): void {
    this.selectedPrescriptionItems = this.selectedPrescriptionItems.filter((item) => item.medicineId !== medicineId);
  }

  async completePrescription(): Promise<void> {
    if (!this.selectedPatientId) {
      alert('Please select the correct patient first.');
      return;
    }

    if (this.selectedPrescriptionItems.length === 0) {
      alert('Please add at least one drug to the prescription.');
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

      const currentUser = this.authService.getCurrentUser();
      const doctorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Doctor';
      const doctorEmail = currentUser?.email || '';

      await this.patientService.addPrescription(this.selectedPatientId, {
        doctorId: currentUser?.uid || '',
        doctorName,
        doctorEmail,
        date: formattedDate,
        notes: `Prescription created by ${doctorName}`,
        medicines: this.selectedPrescriptionItems.map((item) => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          quantity: item.quantity,
          status: item.status
        }))
      });

      await this.patientService.updatePatient(this.selectedPatientId, {
        lastVisitDate: formattedDate
      });

      alert(`Prescription saved for ${this.selectedPatientName}.`);
      this.closePrescriptionModal();
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      const message = error?.message || error?.code || 'Failed to save prescription. Please try again.';
      alert(`Failed to save prescription: ${message}`);
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
