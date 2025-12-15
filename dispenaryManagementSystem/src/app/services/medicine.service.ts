import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Medicine {
  id?: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  category?: string;
  manufacturer?: string;
  batchNumber?: string;
  price?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private medicinesSubject = new BehaviorSubject<Medicine[]>([]);
  public medicines$ = this.medicinesSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.loadMedicines();
  }

  async loadMedicines(): Promise<void> {
    try {
      const medicinesCollection = collection(this.firestore, 'medicines');
      const q = query(medicinesCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const medicines: Medicine[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        medicines.push({
          id: doc.id,
          medicineId: data['medicineId'] || doc.id,
          medicineName: data['medicineName'] || '',
          quantity: data['quantity'] || 0,
          expiryDate: data['expiryDate'] || '',
          status: data['status'] || 'In Stock',
          category: data['category'],
          manufacturer: data['manufacturer'],
          batchNumber: data['batchNumber'],
          price: data['price']
        });
      });
      
      this.medicinesSubject.next(medicines);
    } catch (error) {
      console.error('Error loading medicines:', error);
      throw error;
    }
  }

  async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<string> {
    try {
      const medicinesCollection = collection(this.firestore, 'medicines');
      
      // Generate sequential medicine ID
      const currentMedicines = this.medicinesSubject.value;
      const nextId = currentMedicines.length + 1;
      const medicineId = `MED${String(nextId).padStart(3, '0')}`; // MED001, MED002, etc.
      
      // Auto-calculate status based on quantity
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock';
      if (medicine.quantity === 0) {
        status = 'Out of Stock';
      } else if (medicine.quantity < 50) {
        status = 'Low Stock';
      } else {
        status = 'In Stock';
      }
      
      const docRef = await addDoc(medicinesCollection, {
        medicineId: medicineId,
        medicineName: medicine.medicineName,
        quantity: medicine.quantity,
        expiryDate: medicine.expiryDate,
        status: status,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        batchNumber: medicine.batchNumber,
        price: medicine.price,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      await this.loadMedicines(); // Refresh the list
      return docRef.id;
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw error;
    }
  }

  async updateMedicine(id: string, medicine: Partial<Medicine>): Promise<void> {
    try {
      const medicineDoc = doc(this.firestore, 'medicines', id);
      
      // Auto-calculate status if quantity is being updated
      let updateData: any = { ...medicine };
      if (medicine.quantity !== undefined) {
        if (medicine.quantity === 0) {
          updateData.status = 'Out of Stock';
        } else if (medicine.quantity < 50) {
          updateData.status = 'Low Stock';
        } else {
          updateData.status = 'In Stock';
        }
      }
      
      await updateDoc(medicineDoc, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      
      await this.loadMedicines(); // Refresh the list
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw error;
    }
  }

  async deleteMedicine(id: string): Promise<void> {
    try {
      const medicineDoc = doc(this.firestore, 'medicines', id);
      await deleteDoc(medicineDoc);
      
      await this.loadMedicines(); // Refresh the list
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  }

  getMedicines(): Medicine[] {
    return this.medicinesSubject.value;
  }

  searchMedicines(searchTerm: string): Medicine[] {
    const medicines = this.medicinesSubject.value;
    if (!searchTerm || searchTerm.trim() === '') {
      return medicines;
    }

    const term = searchTerm.toLowerCase().trim();
    return medicines.filter(medicine => 
      medicine.medicineName.toLowerCase().includes(term) ||
      medicine.medicineId.toLowerCase().includes(term) ||
      (medicine.batchNumber && medicine.batchNumber.toLowerCase().includes(term))
    );
  }

  filterMedicines(filters: {
    status?: string;
    category?: string;
    searchTerm?: string;
  }): Medicine[] {
    let medicines = this.medicinesSubject.value;

    // Apply search
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      medicines = this.searchMedicines(filters.searchTerm);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'All Status') {
      medicines = medicines.filter(m => m.status === filters.status);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'All Categories') {
      medicines = medicines.filter(m => m.category === filters.category);
    }

    return medicines;
  }

  getStatistics() {
    const medicines = this.medicinesSubject.value;
    return {
      total: medicines.length,
      inStock: medicines.filter(m => m.status === 'In Stock').length,
      lowStock: medicines.filter(m => m.status === 'Low Stock').length,
      outOfStock: medicines.filter(m => m.status === 'Out of Stock').length,
      totalValue: medicines.reduce((sum, m) => sum + (m.price || 0) * m.quantity, 0)
    };
  }
}
