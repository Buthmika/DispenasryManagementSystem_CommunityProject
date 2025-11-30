import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login';
import { RegisterComponent } from './Components/register/register';
import { PatientFormComponent } from './Components/patientManagement/components/patient-form/patient-form';
import { PatientListComponent } from './Components/patientManagement/components/patient-list/patient-list';
import { SideBar } from './Components/core/side-bar/side-bar';
import { PatientManagementPageComponent } from './Components/patientManagement/pages/patient-management/patient-management';
import { AddPatientComponent } from './Components/patientManagement/pages/add-patient/add-patient';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{path:'patientForm', component: PatientFormComponent},
	{path:'patientList', component: PatientListComponent},
	{path:'sidebar',component: SideBar},
	{path:'patient-management', component: PatientManagementPageComponent},
	{path:'add-patient', component: AddPatientComponent}

];
