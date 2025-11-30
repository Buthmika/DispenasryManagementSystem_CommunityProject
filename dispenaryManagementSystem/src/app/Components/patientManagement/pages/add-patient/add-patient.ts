import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PatientFormComponent } from '../../components/patient-form/patient-form';
import { SideBar } from '../../../core/side-bar/side-bar';
import { CreatePatientRequest, UpdatePatientRequest, Patient } from '../../models/patient.interface';
import { SampleDataService } from '../../services/sample-data.service';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css'],
  standalone: true,
  imports: [CommonModule, PatientFormComponent, SideBar, RouterLink ]
})
export class AddPatientComponent implements OnInit {
  isEditMode: boolean = false;
  patient: Patient | null = null;
  pageTitle: string = 'Add New Patient';
  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sampleDataService: SampleDataService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    const patientId = this.route.snapshot.paramMap.get('id');
    if (patientId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Patient';
      this.loadPatientForEdit(patientId);
    }
  }

  loadPatientForEdit(patientId: string): void {
    this.loading = true;
    this.error = null;

    // Simulate API call with sample data
    setTimeout(() => {
      try {
        const patient = this.sampleDataService.getSampleFullPatient(patientId);
        if (patient) {
          this.patient = patient;
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

  onFormSubmit(patientData: CreatePatientRequest | UpdatePatientRequest): void {
    console.log('Form submitted:', patientData);
    
    // Simulate API call
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    setTimeout(() => {
      try {
        if (this.isEditMode) {
          console.log('Updating patient:', this.patient?.id, patientData);
          this.successMessage = 'Patient updated successfully!';
        } else {
          console.log('Creating new patient:', patientData);
          this.successMessage = 'Patient created successfully!';
        }
        
        // Navigate back to patient list after success
        setTimeout(() => {
          this.router.navigate(['/patients']);
        }, 1500);
        
      } catch (err) {
        this.error = this.isEditMode ? 'Error updating patient' : 'Error creating patient';
        console.error('Form submission error:', err);
      } finally {
        this.loading = false;
      }
    }, 1500);
  }

  onFormCancel(): void {
    // Navigate back to patient list
    this.router.navigate(['/patients']);
  }

  getBreadcrumbItems(): { label: string, route?: string }[] {
    return [
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Patient Management', route: '/patients' },
      { label: this.pageTitle }
    ];
  }
}
