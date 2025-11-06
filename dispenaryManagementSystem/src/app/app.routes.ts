import { Routes } from '@angular/router';

import { RegisterComponent } from './Components/register/register';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	
	{ path: 'register', component: RegisterComponent }
];
