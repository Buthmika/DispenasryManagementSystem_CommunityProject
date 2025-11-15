// Enums for better type safety
export enum PatientCategory {
  PREGNANT_MOTHER = 'Pregnant Mother',
  ESTATE_WORKER = 'Estate Worker',
  FAMILY_MEMBER = 'Family Member',
  OTHER = 'Other'
}

export enum PatientGender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export enum PatientStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TRANSFERRED = 'Transferred'
}

// Constants for form options
export const GENDER_OPTIONS = [
  { value: PatientGender.MALE, label: 'Male' },
  { value: PatientGender.FEMALE, label: 'Female' },
  { value: PatientGender.OTHER, label: 'Other' }
];

export const CATEGORY_OPTIONS = [
  { value: PatientCategory.PREGNANT_MOTHER, label: 'Pregnant Mother' },
  { value: PatientCategory.ESTATE_WORKER, label: 'Estate Worker' },
  { value: PatientCategory.FAMILY_MEMBER, label: 'Family Member' },
  { value: PatientCategory.OTHER, label: 'Other' }
];

export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];