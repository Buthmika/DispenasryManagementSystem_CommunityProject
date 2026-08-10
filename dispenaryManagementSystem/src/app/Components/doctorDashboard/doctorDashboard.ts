// src/app/Components/doctorDashboard/doctorDashboard.ts

import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Medicine, MedicineService } from '../../services/medicine.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './doctorDashboard.html',
  
  styleUrls: ['./doctorDashboard.css'] 
})
export class DoctorDashboardComponent implements OnInit {
  doctorName = 'Doctor';
  doctorEmail = '';
  lowStockMedicines: Medicine[] = [];

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private medicineService: MedicineService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadUserData();

    this.medicineService.medicines$.subscribe((medicines) => {
      this.lowStockMedicines = medicines.filter(
        (medicine) => medicine.status === 'Low Stock' || medicine.status === 'Out of Stock'
      );
    });

    await this.medicineService.loadMedicines();
  }

  async loadUserData(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.doctorEmail = user.email || '';
      
      // Get user data from Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.doctorName = userData['displayName'] || 'Doctor';
      }
    }
  }

  logout(): void {
    this.authService.logout();
  }

}