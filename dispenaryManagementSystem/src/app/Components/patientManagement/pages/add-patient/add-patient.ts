import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PatientFormComponent } from '../../components/patient-form/patient-form';
import { SideBar } from '../../../core/side-bar/side-bar';
import { CreatePatientRequest, UpdatePatientRequest, Patient } from '../../models/patient.interface';
import { PatientService } from '../../services/patient.service';

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
    private patientService: PatientService
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

    try {
      const patients = this.patientService.getPatients();
      const patientData = patients.find(p => p.id === patientId);
      if (patientData) {
        // Convert PatientList to Patient format
        this.patient = {
          id: patientData.id,
          patientId: patientData.patientId,
          personalInfo: {
            fullName: patientData.fullName,
            age: patientData.age,
            dateOfBirth: '',
            gender: patientData.gender as 'Male' | 'Female' | 'Other',
            phoneNumber: patientData.phoneNumber,
            address: '',
            emergencyContact: '',
            emergencyPhone: ''
          },
          category: patientData.category as any,
          medicalInfo: {
            allergies: [],
            chronicConditions: [],
            currentMedications: []
          },
          status: patientData.status as any,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: '',
          lastVisitDate: patientData.lastVisitDate
        };
      } else {
        this.error = 'Patient not found';
      }
    } catch (err) {
      this.error = 'Error loading patient data';
      console.error('Error loading patient:', err);
    } finally {
      this.loading = false;
    }
  }

  async onFormSubmit(patientData: CreatePatientRequest | UpdatePatientRequest): Promise<void> {
    console.log('Form submitted:', patientData);
    
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    try {
      if (this.isEditMode && this.patient) {
        await this.patientService.updatePatient(this.patient.id, patientData);
        this.successMessage = 'Patient updated successfully!';
      } else {
        // Convert CreatePatientRequest to PatientList format for saving
        const createData = patientData as CreatePatientRequest;
        
        if (!createData.personalInfo) {
          throw new Error('Personal information is required');
        }
        
        const newPatient = {
          patientId: '', // Will be auto-generated
          fullName: createData.personalInfo.fullName,
          age: createData.personalInfo.age,
          gender: createData.personalInfo.gender,
          category: createData.category,
          phoneNumber: createData.personalInfo.phoneNumber,
          lastVisitDate: new Date().toISOString(),
          status: 'Active' as const,
          isPregnant: createData.pregnancyDetails?.isPregnant || false
        };
        
        await this.patientService.addPatient(newPatient);
        this.successMessage = 'Patient created successfully!';
      }
      
      // Navigate back to patient management after success
      setTimeout(() => {
        this.router.navigate(['/patient-management']);
      }, 1500);
      
    } catch (err) {
      this.error = this.isEditMode ? 'Error updating patient' : 'Error creating patient';
      console.error('Form submission error:', err);
    } finally {
      this.loading = false;
    }
  }

  onFormCancel(): void {
    // Navigate back to patient management
    this.router.navigate(['/patient-management']);
  }

  getBreadcrumbItems(): { label: string, route?: string }[] {
    return [
      { label: 'Dashboard', route: '/doctor-dashboard' },
      { label: 'Patient Management', route: '/patient-management' },
      { label: this.pageTitle }
    ];
  }
}
