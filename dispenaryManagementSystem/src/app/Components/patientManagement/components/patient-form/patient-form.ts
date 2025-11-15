import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../../models/patient.interface';
import { GENDER_OPTIONS, CATEGORY_OPTIONS, BLOOD_GROUP_OPTIONS } from '../../constants/patients.constants';
import { PatientCategory } from '../../constants/patients.constants';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PatientFormComponent implements OnInit, OnChanges {
  @Input() patient?: Patient; // For edit mode
  @Input() isEditMode: boolean = false;
  @Output() formSubmit = new EventEmitter<CreatePatientRequest | UpdatePatientRequest>();
  @Output() formCancel = new EventEmitter<void>();

  patientForm!: FormGroup;
  isSubmitting = false;

  // Form options
  genderOptions = GENDER_OPTIONS;
  categoryOptions = CATEGORY_OPTIONS;
  bloodGroupOptions = BLOOD_GROUP_OPTIONS;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    if (this.patient && this.isEditMode) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.patientForm = this.fb.group({
      personalInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        age: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+-\s]+$/)]],
        address: ['', Validators.required],
        emergencyContact: [''],
        emergencyPhone: ['']
      }),

      category: ['', Validators.required],

      pregnancyDetails: this.fb.group({
        isPregnant: [false],
        lmpDate: [''], // Last Menstrual Period
        edd: [''], // Expected Due Date
        pregnancyWeek: [''],
        highRisk: [false],
        notes: ['']
      }),

      medicalInfo: this.fb.group({
        bloodGroup: [''],
        allergies: [''],
        chronicConditions: [''],
        currentMedications: [''],
        medicalHistory: [''],
        notes: ['']
      })
    });

    // Show/hide pregnancy details based on category and isPregnant
    this.patientForm.get('category')?.valueChanges.subscribe(category => {
      this.togglePregnancyFields(category);
    });

    this.patientForm.get('pregnancyDetails.isPregnant')?.valueChanges.subscribe(isPregnant => {
      const category = this.patientForm.get('category')?.value;
      this.togglePregnancyFields(category, isPregnant);
    });
  }

  private populateForm(): void {
    if (!this.patient) return;

    this.patientForm.patchValue({
      personalInfo: {
        fullName: this.patient.personalInfo.fullName,
        age: this.patient.personalInfo.age,
        dateOfBirth: this.formatDateForInput(this.patient.personalInfo.dateOfBirth),
        gender: this.patient.personalInfo.gender,
        phoneNumber: this.patient.personalInfo.phoneNumber,
        address: this.patient.personalInfo.address,
        emergencyContact: this.patient.personalInfo.emergencyContact || '',
        emergencyPhone: this.patient.personalInfo.emergencyPhone || ''
      },
      category: this.patient.category,
      pregnancyDetails: this.patient.pregnancyDetails || {
        isPregnant: false,
        lmpDate: '',
        edd: '',
        pregnancyWeek: '',
        highRisk: false,
        notes: ''
      },
      medicalInfo: this.patient.medicalInfo
    });
  }

  private togglePregnancyFields(category: string, isPregnant?: boolean): void {
    const pregnancyGroup = this.patientForm.get('pregnancyDetails');
    
    if (category === PatientCategory.PREGNANT_MOTHER || isPregnant) {
      pregnancyGroup?.get('isPregnant')?.setValue(true);
      pregnancyGroup?.get('lmpDate')?.setValidators(Validators.required);
      pregnancyGroup?.get('edd')?.setValidators(Validators.required);
    } else {
      pregnancyGroup?.get('isPregnant')?.setValue(false);
      pregnancyGroup?.get('lmpDate')?.clearValidators();
      pregnancyGroup?.get('edd')?.clearValidators();
    }

    pregnancyGroup?.get('lmpDate')?.updateValueAndValidity();
    pregnancyGroup?.get('edd')?.updateValueAndValidity();
  }

  private formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.patientForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.patientForm.value;

      // Clean up pregnancy details if not pregnant
      if (!formValue.pregnancyDetails.isPregnant) {
        formValue.pregnancyDetails = {
          isPregnant: false,
          lmpDate: null,
          edd: null,
          pregnancyWeek: null,
          highRisk: false,
          notes: ''
        };
      }

      // Convert string arrays from textareas
      if (formValue.medicalInfo.allergies) {
        formValue.medicalInfo.allergies = this.parseTextToArray(formValue.medicalInfo.allergies);
      }
      if (formValue.medicalInfo.chronicConditions) {
        formValue.medicalInfo.chronicConditions = this.parseTextToArray(formValue.medicalInfo.chronicConditions);
      }
      if (formValue.medicalInfo.currentMedications) {
        formValue.medicalInfo.currentMedications = this.parseTextToArray(formValue.medicalInfo.currentMedications);
      }

      this.formSubmit.emit(formValue);
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private parseTextToArray(text: string): string[] {
    return text.split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldPath: string): boolean {
    const field = this.patientForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldPath: string): string {
    const field = this.patientForm.get(fieldPath);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
      if (field.errors['pattern']) return 'Invalid format';
    }
    return '';
  }

  // Check if pregnancy section should be shown
  showPregnancySection(): boolean {
    const category = this.patientForm.get('category')?.value;
    const isPregnant = this.patientForm.get('pregnancyDetails.isPregnant')?.value;
    return category === PatientCategory.PREGNANT_MOTHER || isPregnant;
  }
}