import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../core/side-bar/side-bar';
import { MedicineService, Medicine } from '../../services/medicine.service';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterOutlet, SideBar],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit, OnDestroy {
  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'All Status';
  selectedCategory: string = 'All Categories';
  medicineForm: FormGroup;
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  editingMedicineId: string | null = null;
  loading: boolean = false;
  
  private medicinesSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private medicineService: MedicineService
  ) {
    this.medicineForm = this.fb.group({
      medicineName: ['', [Validators.required, Validators.minLength(2)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      expiryDate: ['', Validators.required],
      category: [''],
      manufacturer: [''],
      batchNumber: [''],
      price: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  ngOnDestroy(): void {
    if (this.medicinesSubscription) {
      this.medicinesSubscription.unsubscribe();
    }
  }

  loadMedicines(): void {
    this.loading = true;
    this.medicinesSubscription = this.medicineService.medicines$.subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.updateFilteredMedicines();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading medicines:', err);
        this.loading = false;
      }
    });
  }

  // Search functionality
  searchMedicine(): void {
    this.updateFilteredMedicines();
  }

  // Apply searchTerm and status filters
  updateFilteredMedicines(): void {
    this.filteredMedicines = this.medicineService.filterMedicines({
      searchTerm: this.searchTerm,
      status: this.selectedStatus,
      category: this.selectedCategory
    });
  }

  // Clear both search and status filters
  clearFilters(): void {
    this.selectedStatus = 'All Status';
    this.selectedCategory = 'All Categories';
    this.searchTerm = '';
    this.updateFilteredMedicines();
  }

  // Counts for status badges
  get inStockCount(): number { 
    return this.medicines.filter(m => m.status === 'In Stock').length; 
  }
  
  get lowStockCount(): number { 
    return this.medicines.filter(m => m.status === 'Low Stock').length; 
  }
  
  get outOfStockCount(): number { 
    return this.medicines.filter(m => m.status === 'Out of Stock').length; 
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock':
        return 'status-in-stock';
      case 'Low Stock':
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
      expiryDate: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      price: 0
    });
    this.isModalOpen = true;
  }

  // Open modal for editing medicine
  editMedicine(medicine: Medicine): void {
    this.isEditMode = true;
    this.editingMedicineId = medicine.id || null;
    
    // Convert date format from DD-MM-YYYY to YYYY-MM-DD for input type="date"
    let formattedDate = medicine.expiryDate;
    if (medicine.expiryDate.includes('-')) {
      const dateParts = medicine.expiryDate.split('-');
      if (dateParts.length === 3 && dateParts[0].length <= 2) {
        formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
    }
    
    this.medicineForm.patchValue({
      medicineName: medicine.medicineName,
      quantity: medicine.quantity,
      expiryDate: formattedDate,
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      batchNumber: medicine.batchNumber || '',
      price: medicine.price || 0
    });
    this.isModalOpen = true;
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
    this.medicineForm.reset();
  }

  // Save medicine (add or update)
  async saveMedicine(): Promise<void> {
    if (this.medicineForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.medicineForm.value;
    
    // Convert date from YYYY-MM-DD to DD-MM-YYYY
    const date = new Date(formValue.expiryDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    const medicineData: Omit<Medicine, 'id'> = {
      medicineId: '', // Will be auto-generated
      medicineName: formValue.medicineName,
      quantity: formValue.quantity,
      expiryDate: formattedDate,
      status: 'In Stock', // Will be auto-calculated
      category: formValue.category,
      manufacturer: formValue.manufacturer,
      batchNumber: formValue.batchNumber,
      price: formValue.price
    };

    try {
      if (this.isEditMode && this.editingMedicineId) {
        await this.medicineService.updateMedicine(this.editingMedicineId, medicineData);
      } else {
        await this.medicineService.addMedicine(medicineData);
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert('Failed to save medicine. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  // Delete medicine
  async deleteMedicine(id: string | undefined): Promise<void> {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this medicine?')) {
      this.loading = true;
      try {
        await this.medicineService.deleteMedicine(id);
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Failed to delete medicine. Please try again.');
      } finally {
        this.loading = false;
      }
    }
  }

  // Delete medicine from modal (edit mode only)
  async deleteFromModal(): Promise<void> {
    if (!this.editingMedicineId) return;
    
    if (confirm('Are you sure you want to delete this medicine?')) {
      this.loading = true;
      try {
        await this.medicineService.deleteMedicine(this.editingMedicineId);
        this.closeModal();
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Failed to delete medicine. Please try again.');
      } finally {
        this.loading = false;
      }
    }
  }

  // Generate drugs report
  generateDrugsReport(): void {
    const stats = this.medicineService.getStatistics();
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: 'Pharmacy Inventory Report',
      subject: 'Medicine Stock Report',
      author: 'ClinicPlus Dispensary',
      keywords: 'inventory, medicine, pharmacy',
      creator: 'ClinicPlus'
    });

    // Colors
    const primaryColor = '#2563eb'; // Blue
    const secondaryColor = '#64748b'; // Gray
    const successColor = '#22c55e'; // Green
    const warningColor = '#f59e0b'; // Orange
    const dangerColor = '#ef4444'; // Red

    // Header Section
    doc.setFillColor(37, 99, 235); // Primary blue
    doc.rect(0, 0, 220, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ClinicPlus Dispensary', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Pharmacy Inventory Report', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${reportDate}`, 105, 33, { align: 'center' });

    // Statistics Section
    let yPosition = 50;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 14, yPosition);
    
    yPosition += 10;

    // Statistics Cards
    const cardWidth = 45;
    const cardHeight = 25;
    const cardSpacing = 3;
    const startX = 14;

    // Total Medicines Card
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(startX, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Medicines', startX + cardWidth / 2, yPosition + 8, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(stats.total.toString(), startX + cardWidth / 2, yPosition + 19, { align: 'center' });

    // In Stock Card
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(startX + cardWidth + cardSpacing, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('In Stock', startX + cardWidth + cardSpacing + cardWidth / 2, yPosition + 8, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(stats.inStock.toString(), startX + cardWidth + cardSpacing + cardWidth / 2, yPosition + 19, { align: 'center' });

    // Low Stock Card
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(startX + (cardWidth + cardSpacing) * 2, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Low Stock', startX + (cardWidth + cardSpacing) * 2 + cardWidth / 2, yPosition + 8, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(stats.lowStock.toString(), startX + (cardWidth + cardSpacing) * 2 + cardWidth / 2, yPosition + 19, { align: 'center' });

    // Out of Stock Card
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(startX + (cardWidth + cardSpacing) * 3, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Out of Stock', startX + (cardWidth + cardSpacing) * 3 + cardWidth / 2, yPosition + 8, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(stats.outOfStock.toString(), startX + (cardWidth + cardSpacing) * 3 + cardWidth / 2, yPosition + 19, { align: 'center' });

    yPosition += 35;

    // Total Value
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Inventory Value: $${stats.totalValue.toFixed(2)}`, 14, yPosition);

    yPosition += 10;

    // Medicine List Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicine Inventory Details', 14, yPosition);
    
    yPosition += 5;

    // Prepare table data
    const tableData = this.medicines.map((medicine, index) => [
      (index + 1).toString(),
      medicine.medicineId,
      medicine.medicineName,
      medicine.quantity.toString(),
      medicine.expiryDate,
      medicine.status,
      medicine.category || '-',
      `$${(medicine.price || 0).toFixed(2)}`
    ]);

    // Create table
    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Medicine ID', 'Name', 'Quantity', 'Expiry Date', 'Status', 'Category', 'Price']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25 },
        7: { cellWidth: 20, halign: 'right' }
      },
      didParseCell: function(data) {
        // Color code the status column
        if (data.column.index === 5 && data.section === 'body') {
          const status = data.cell.raw as string;
          if (status === 'In Stock') {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Low Stock') {
            data.cell.styles.textColor = [245, 158, 11];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Out of Stock') {
            data.cell.styles.textColor = [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { top: 10, left: 14, right: 14 }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'ClinicPlus Dispensary Management System',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Save the PDF
    const fileName = `Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    // Show success message
    alert(`Report generated successfully!\nFile: ${fileName}`);
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

  async refreshMedicines(): Promise<void> {
    this.loading = true;
    try {
      await this.medicineService.loadMedicines();
    } catch (error) {
      console.error('Error refreshing medicines:', error);
    } finally {
      this.loading = false;
    }
  }
}