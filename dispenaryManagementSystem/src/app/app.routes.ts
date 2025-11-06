import { Routes } from '@angular/router';
<<<<<<< Updated upstream
import { LoginComponent } from './login.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent }
=======
import { RegisterComponent } from './auth/register/register';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent }
>>>>>>> Stashed changes
];
