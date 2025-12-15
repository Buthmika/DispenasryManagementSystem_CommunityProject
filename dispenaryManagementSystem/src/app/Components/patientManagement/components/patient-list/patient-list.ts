import { Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientList, PatientFilter } from '../../models/patient.interface';
import { PatientStatus, PatientCategory } from '../../constants/patients.constants';
import { STATUS_OPTIONS, CATEGORY_OPTIONS, GENDER_OPTIONS } from '../../constants/patients.constants';
import { SampleDataService } from '../../services/sample-data.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule]
})
export class PatientListComponent implements OnInit {
  @Input() patients: PatientList[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  
  @Output() patientSelected = new EventEmitter<string>(); // patient id
  @Output() patientEdit = new EventEmitter<string>(); // patient id
  @Output() patientDelete = new EventEmitter<string>(); // patient id
  @Output() filtersChanged = new EventEmitter<PatientFilter>();

  // Filter properties
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedGender: string = '';
  selectedStatus: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Sort
  sortColumn: keyof PatientList = 'fullName';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filter options
  categoryOptions = CATEGORY_OPTIONS;
  genderOptions = GENDER_OPTIONS;
  statusOptions = STATUS_OPTIONS;

  //add sample data for testing
  
  private sampleDataService: SampleDataService;

  constructor() {
    this.sampleDataService = new SampleDataService();
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  get filteredPatients(): PatientList[] {
    let filtered = this.patients;

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(patient =>
        patient.fullName.toLowerCase().includes(term) ||
        patient.patientId.toLowerCase().includes(term) ||
        patient.phoneNumber.includes(term)
      );
    }

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'All Categories') {
      filtered = filtered.filter(patient => patient.category === this.selectedCategory);
    }

    // Apply gender filter
    if (this.selectedGender && this.selectedGender !== 'All Genders') {
      filtered = filtered.filter(patient => patient.gender === this.selectedGender);
    }

    // Apply status filter
    if (this.selectedStatus && this.selectedStatus !== 'All Status') {
      filtered = filtered.filter(patient => patient.status === this.selectedStatus);
    }

    // Apply sorting
    filtered = this.sortPatients(filtered);

    // Calculate pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  get totalFilteredCount(): number {
    return this.filteredPatients.length;
  }

  private sortPatients(patients: PatientList[]): PatientList[] {
    return patients.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return this.sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      return 0;
    });
  }

  applyFilters(): void {
    const filters: PatientFilter = {
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      gender: this.selectedGender || undefined,
      status: this.selectedStatus || undefined
    };

    this.filtersChanged.emit(filters);
    this.currentPage = 1; // Reset to first page when filters change
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedGender = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  onSort(column: keyof PatientList): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onPatientSelect(patientId: string): void {
    this.patientSelected.emit(patientId);
  }

  onPatientEdit(patientId: string, event: Event): void {
    event.stopPropagation();
    this.patientEdit.emit(patientId);
  }

  onPatientDelete(patientId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      this.patientDelete.emit(patientId);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case PatientStatus.ACTIVE: return 'status-active';
      case PatientStatus.INACTIVE: return 'status-inactive';
      case PatientStatus.TRANSFERRED: return 'status-transferred';
      default: return 'status-unknown';
    }
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case PatientCategory.PREGNANT_MOTHER: return 'category-pregnant';
      case PatientCategory.ESTATE_WORKER: return 'category-worker';
      case PatientCategory.FAMILY_MEMBER: return 'category-family';
      default: return 'category-other';
    }
  }

  getPregnancyBadge(patient: PatientList): string {
    return patient.isPregnant ? 'Pregnant' : '';
  }

  // Generate page numbers for pagination
  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}