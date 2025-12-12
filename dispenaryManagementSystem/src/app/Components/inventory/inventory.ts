import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../core/side-bar/side-bar';
interface Medicine {
  id?: number;
  medicineName: string;
  quantity: number;
  expiryDate: string;
  status: 'In Stock' | 'Low of Stock' | 'Out of Stock';
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterOutlet, SideBar],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit {
  medicines: Medicine[] = [
    {
      id: 1,
      medicineName: 'Paracetamol',
      quantity: 500,
      expiryDate: '20-08-2026',
      status: 'In Stock'
    },
    {
      id: 2,
      medicineName: 'Amoxicillin',
      quantity: 150,
      expiryDate: '15-05-2027',
      status: 'In Stock'
    },
    {
      id: 3,
      medicineName: 'Ibuprofen',
      quantity: 20,
      expiryDate: '04-12-2026',
      status: 'Low of Stock'
    },
    {
      id: 4,
      medicineName: 'Aspirin',
      quantity: 300,
      expiryDate: '18-10-2026',
      status: 'In Stock'
    },
    {
      id: 5,
      medicineName: 'Loratadine',
      quantity: 0,
      expiryDate: '16-04-2026',
      status: 'Out of Stock'
    },
    {
      id: 6,
      medicineName: 'Cetirizine',
      quantity: 15,
      expiryDate: '08-05-2026',
      status: 'Low of Stock'
    }
  ];

  filteredMedicines: Medicine[] = [];
  searchTerm: string = '';
  selectedStatus: 'All' | 'In Stock' | 'Low of Stock' | 'Out of Stock' = 'All';
  medicineForm: FormGroup;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingMedicineId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.medicineForm = this.fb.group({
      medicineName: ['', [Validators.required, Validators.minLength(2)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      expiryDate: ['', Validators.required],
      status: ['In Stock', Validators.required]
    });
  }

  ngOnInit(): void {
    this.updateFilteredMedicines();
    // Debug: log medicines/statuses to help troubleshoot missing status output
    console.debug('inventory: medicines', this.medicines.map(m => ({ id: m.id, name: m.medicineName, status: m.status })));
    console.debug('inventory: filteredMedicines', this.filteredMedicines.map(m => ({ id: m.id, name: m.medicineName, status: m.status })));
  }

  // Search functionality
  searchMedicine(): void {
    this.updateFilteredMedicines();
  }

  // Apply searchTerm and selectedStatus filters
  updateFilteredMedicines(): void {
    const searchLower = this.searchTerm ? this.searchTerm.toLowerCase() : '';
    this.filteredMedicines = this.medicines.filter(m => {
      const matchesSearch = !searchLower || m.medicineName.toLowerCase().includes(searchLower);
      const matchesStatus = this.selectedStatus === 'All' || m.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  // Clear both search and status filters
  clearFilters(): void {
    this.selectedStatus = 'All';
    this.searchTerm = '';
    this.updateFilteredMedicines();
  }

  // Counts for status badges
  get inStockCount(): number { return this.medicines.filter(m => m.status === 'In Stock').length; }
  get lowStockCount(): number { return this.medicines.filter(m => m.status === 'Low of Stock').length; }
  get outOfStockCount(): number { return this.medicines.filter(m => m.status === 'Out of Stock').length; }

  // Determine status based on quantity
  private determineStatus(quantity: number): 'In Stock' | 'Low of Stock' | 'Out of Stock' {
    if (quantity === 0) {
      return 'Out of Stock';
    } else if (quantity <= 50) {
      return 'Low of Stock';
    } else {
      return 'In Stock';
    }
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock':
        return 'status-in-stock';
      case 'Low of Stock':
        return 'status-low-stock';
      case 'Out of Stock':
        return 'status-out-stock';
      default:
        return '';
    }
  }

  // Open modal for adding new medicine
  openAddModal(): void {
    this.isEditMode = false;
    this.editingMedicineId = null;
    this.medicineForm.reset({
      medicineName: '',
      quantity: 0,
      expiryDate: ''
    });
    this.isModalOpen = true;
  }

  // Open modal for editing medicine
  editMedicine(medicine: Medicine): void {
    this.isEditMode = true;
    this.editingMedicineId = medicine.id || null;
    
    // Convert date format from DD-MM-YYYY to YYYY-MM-DD for input type="date"
    const dateParts = medicine.expiryDate.split('-');
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    this.medicineForm.patchValue({
      medicineName: medicine.medicineName,
      quantity: medicine.quantity,
      expiryDate: formattedDate,
      status: medicine.status
    });
    this.isModalOpen = true;
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
    this.medicineForm.reset();
  }

  // Save medicine (add or update)
  saveMedicine(): void {
    if (this.medicineForm.invalid) {
      return;
    }

    const formValue = this.medicineForm.value;
    
    // Convert date from YYYY-MM-DD to DD-MM-YYYY
    const date = new Date(formValue.expiryDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const medicineData: Medicine = {
      medicineName: formValue.medicineName,
      quantity: formValue.quantity,
      expiryDate: formattedDate,
      status: formValue.status || this.determineStatus(formValue.quantity)
    };

    if (this.isEditMode && this.editingMedicineId !== null) {
      // Update existing medicine
      const index = this.medicines.findIndex(m => m.id === this.editingMedicineId);
      if (index !== -1) {
        this.medicines[index] = {
          ...medicineData,
          id: this.editingMedicineId
        };
      }
    } else {
      // Add new medicine
      const newId = this.medicines.length > 0 
        ? Math.max(...this.medicines.map(m => m.id || 0)) + 1 
        : 1;
      this.medicines.push({
        ...medicineData,
        id: newId
      });
    }

    this.filteredMedicines = [...this.medicines];
    this.closeModal();
  }

  // Delete medicine
  deleteMedicine(id: number | undefined): void {
    if (id === undefined) return;
    
    if (confirm('Are you sure you want to delete this medicine?')) {
      this.medicines = this.medicines.filter(m => m.id !== id);
      this.filteredMedicines = [...this.medicines];
    }
  }

  // Delete medicine from modal (edit mode only)
  deleteFromModal(): void {
    if (this.editingMedicineId === null) return;
    
    if (confirm('Are you sure you want to delete this medicine?')) {
      this.medicines = this.medicines.filter(m => m.id !== this.editingMedicineId);
      this.filteredMedicines = [...this.medicines];
      this.closeModal();
    }
  }

  // Generate drugs report
  generateDrugsReport(): void {
    // Prepare report data
    const reportData = {
      totalMedicines: this.medicines.length,
      inStock: this.medicines.filter(m => m.status === 'In Stock').length,
      lowStock: this.medicines.filter(m => m.status === 'Low of Stock').length,
      outOfStock: this.medicines.filter(m => m.status === 'Out of Stock').length,
      medicines: this.medicines
    };

    console.log('Generating Report:', reportData);
    
    // Here you can implement actual report generation
    // For example: export to PDF, Excel, or print
    alert('Report generation functionality would be implemented here');
  }

  // Check if medicine is expiring soon (within 3 months)
  isExpiringSoon(expiryDate: string): boolean {
    const dateParts = expiryDate.split('-');
    if (dateParts.length !== 3) return false;
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    const expiry = new Date(year, month, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    return expiry <= threeMonthsFromNow && expiry >= today;
  }
}