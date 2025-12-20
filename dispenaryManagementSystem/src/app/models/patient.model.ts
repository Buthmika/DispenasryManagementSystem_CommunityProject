export interface Patient {
  id?: string;
  name: string;
  gender: string;
  admissionDate?: string;      // Made optional
  diagnosis?: string;
  
  // --- ADD THESE FIELDS ---
  status?: string;             // Needed for "Active" check
  isPregnant?: boolean | string; // Needed for "Pregnant" check
  createdAt?: any;             // Needed for the Chart Dates (Firestore Timestamp)
}