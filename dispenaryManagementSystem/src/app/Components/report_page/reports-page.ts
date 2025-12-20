import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs'; 

// Services
import { PatientService } from '../../services/patient.service';
import { MedicineService, Medicine } from '../../services/medicine.service';
import { Patient } from '../../models/patient.model';

// PDF Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports-page.html',
  styleUrls: ['./reports-page.css']
})
export class ReportsPageComponent implements OnInit, OnDestroy {

  private patientService = inject(PatientService);
  private medicineService = inject(MedicineService);
  private patientsSubscription?: Subscription; 

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Summary Variables
  public totalActivePatients = 0;
  public totalPregnant = 0;
  public newRegistrations = 0;

  // Chart Config
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { data: [], label: 'Active Patients', backgroundColor: '#3b82f6', borderRadius: 5, barThickness: 15 },
      { data: [], label: 'Pregnant Women', backgroundColor: '#ec4899', borderRadius: 5, barThickness: 15 }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top', align: 'end' } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
  };

  ngOnInit(): void {
    this.patientService.loadPatients();
    this.patientsSubscription = this.patientService.patients$.subscribe({
      next: (patients) => {
        this.processChartData(patients);
      },
      error: (err) => console.error('Error getting report data:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.patientsSubscription) {
      this.patientsSubscription.unsubscribe();
    }
  }

  processChartData(patients: Patient[]) {
    const activeCounts = new Array(12).fill(0);
    const pregnantCounts = new Array(12).fill(0);
    let newRegTotal = 0;
    const currentMonth = new Date().getMonth();

    patients.forEach(patient => {
      let dateObj: Date = new Date();
      if (patient.createdAt && typeof patient.createdAt.toDate === 'function') {
        dateObj = patient.createdAt.toDate();
      } else if (patient.createdAt) {
        dateObj = new Date(patient.createdAt);
      } else if (patient.admissionDate) {
        dateObj = new Date(patient.admissionDate);
      }

      const monthIndex = dateObj.getMonth();
      const isActive = patient.status && patient.status.toLowerCase() === 'active';
      const isPregnant = patient.isPregnant === true || String(patient.isPregnant) === 'true';

      if (isActive && monthIndex >= 0 && monthIndex <= 11) {
        activeCounts[monthIndex]++;
      }
      if (isActive && isPregnant && monthIndex >= 0 && monthIndex <= 11) {
        pregnantCounts[monthIndex]++;
      }
      if (monthIndex === currentMonth) {
        newRegTotal++;
      }
    });

    const stats = this.patientService.getStatistics(); 
    this.totalActivePatients = stats.active; 
    this.totalPregnant = stats.pregnant;
    this.newRegistrations = newRegTotal; 

    this.barChartData.datasets[0].data = activeCounts;
    this.barChartData.datasets[1].data = pregnantCounts;
    this.chart?.update();
  }

  // --- GENERATE COLORFUL PDF REPORT (Matches Screenshot Style) ---
  generateDrugsReport() {
    this.medicineService.medicines$.subscribe((medicines: Medicine[]) => {
      const doc = new jsPDF();
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + 
                      ' at ' + today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // --- COLORS ---
      const blueColor = '#3b82f6';   
      const greenColor = '#22c55e';  
      const orangeColor = '#f59e0b'; 
      const redColor = '#ef4444';    
      const whiteColor = '#ffffff';

      // --- 1. FULL WIDTH BLUE HEADER ---
      doc.setFillColor(blueColor);
      doc.rect(0, 0, 210, 50, 'F');

      // Add White Text
      doc.setTextColor(whiteColor);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('ClinicPlus Dispensary', 105, 20, { align: 'center' }); 

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Pharmacy Inventory Report', 105, 30, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Generated on: ${dateStr}`, 105, 40, { align: 'center' });

      // --- 2. CALCULATE STATS ---
      const totalItems = medicines.length;
      const inStock = medicines.filter(m => m.status === 'In Stock').length;
      const lowStock = medicines.filter(m => m.status === 'Low Stock').length;
      const outOfStock = medicines.filter(m => m.status === 'Out of Stock').length;
      const totalValue = medicines.reduce((sum, m) => sum + ((m.price || 0) * m.quantity), 0);

      // --- 3. COLORFUL SUMMARY CARDS ---
      const startY = 60;
      const cardWidth = 40;
      const cardHeight = 30;
      const gap = 8;
      const marginLeft = 14;

      doc.setTextColor(0, 0, 0); // Black text for section title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', marginLeft, startY - 5);

      // Card 1: Total (Blue)
      doc.setFillColor(blueColor);
      doc.roundedRect(marginLeft, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setTextColor(whiteColor);
      doc.setFontSize(10);
      doc.text('Total Medicines', marginLeft + (cardWidth/2), startY + 10, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(totalItems.toString(), marginLeft + (cardWidth/2), startY + 22, { align: 'center' });

      // Card 2: In Stock (Green)
      let currentX = marginLeft + cardWidth + gap;
      doc.setFillColor(greenColor);
      doc.roundedRect(currentX, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setTextColor(whiteColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('In Stock', currentX + (cardWidth/2), startY + 10, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(inStock.toString(), currentX + (cardWidth/2), startY + 22, { align: 'center' });

      // Card 3: Low Stock (Orange)
      currentX += cardWidth + gap;
      doc.setFillColor(orangeColor);
      doc.roundedRect(currentX, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setTextColor(whiteColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Low Stock', currentX + (cardWidth/2), startY + 10, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(lowStock.toString(), currentX + (cardWidth/2), startY + 22, { align: 'center' });

      // Card 4: Out of Stock (Red)
      currentX += cardWidth + gap;
      doc.setFillColor(redColor);
      doc.roundedRect(currentX, startY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setTextColor(whiteColor);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Out of Stock', currentX + (cardWidth/2), startY + 10, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(outOfStock.toString(), currentX + (cardWidth/2), startY + 22, { align: 'center' });

      // --- 4. TEXT INFO (Value & Table Title) ---
      const infoY = startY + cardHeight + 15;
      
      doc.setTextColor(0, 0, 0); // Back to black
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`, marginLeft, infoY);

      doc.setFontSize(14);
      doc.text('Medicine Inventory Details', marginLeft, infoY + 10);

      // --- 5. THE TABLE (Blue Header) ---
      const head = [['#', 'Medicine ID', 'Name', 'Quantity', 'Expiry Date', 'Status', 'Category', 'Price']];
      const body = medicines.map((m, index) => [
        index + 1,
        m.medicineId || '-',
        m.medicineName || '-',
        m.quantity,
        m.expiryDate || '-',
        m.status,
        m.category || '-',
        `$${(m.price || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        head: head,
        body: body,
        startY: infoY + 15,
        theme: 'grid', 
        headStyles: { fillColor: blueColor, textColor: 255, fontStyle: 'bold', halign: 'left' },
        styles: { fontSize: 9, cellPadding: 3, textColor: 50 },
        alternateRowStyles: { fillColor: [248, 250, 252] }, 
        
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
             const status = data.cell.raw;
             data.cell.styles.fontStyle = 'bold';
             if (status === 'Low Stock') data.cell.styles.textColor = orangeColor;
             if (status === 'Out of Stock') data.cell.styles.textColor = redColor;
             if (status === 'In Stock') data.cell.styles.textColor = greenColor;
          }
        }
      });

      doc.save('Inventory_Report_Colorful.pdf');
    });
  }
}