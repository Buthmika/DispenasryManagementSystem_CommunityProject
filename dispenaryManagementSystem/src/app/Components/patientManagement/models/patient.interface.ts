export interface Patient {
  id: string; // Firebase document ID
  patientId: string; // Custom patient ID (e.g., PAT001)
  
  // Personal Information
  personalInfo: {
    fullName: string;
    age: number;
    dateOfBirth: Date | string;
    gender: 'Male' | 'Female' | 'Other';
    phoneNumber: string;
    address: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  };

  // Medical Category (from your project requirements)
  category: 'Pregnant Mother' | 'Estate Worker' | 'Family Member' | 'Other';
  
  // Pregnancy Details (if applicable)
  pregnancyDetails?: {
    isPregnant: boolean;
    lmpDate?: Date | string; // Last Menstrual Period
    edd?: Date | string; // Expected Due Date
    pregnancyWeek?: number;
    highRisk?: boolean;
    notes?: string;
  };

  // Medical Information
  medicalInfo: {
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    chronicConditions?: string[];
    currentMedications?: string[];
    medicalHistory?: string;
    notes?: string; // Special details from your form
  };

  // System & Timestamps
  status: 'Active' | 'Inactive' | 'Transferred';
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string; // User ID who created the record
  lastVisitDate?: Date | string;
}

// For creating new patients (without id and timestamps)
export interface CreatePatientRequest {
  personalInfo: Omit<Patient['personalInfo'], ''>;
  category: Patient['category'];
  pregnancyDetails?: Patient['pregnancyDetails'];
  medicalInfo: Patient['medicalInfo'];
}

// For updating patients
export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  updatedAt: Date | string;
}

// For patient list display (lightweight)
export interface PatientList {
  id: string;
  patientId: string;
  fullName: string;
  age: number;
  gender: string;
  category: string;
  phoneNumber: string;
  lastVisitDate?: Date | string;
  status: string;
  isPregnant?: boolean;
}

// For search and filters
export interface PatientFilter {
  searchTerm?: string;
  category?: string;
  gender?: string;
  status?: string;
  isPregnant?: boolean;
  ageRange?: { min: number; max: number };
}

// For table columns
export interface PatientTableColumn {
  key: keyof PatientList | 'actions';
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}