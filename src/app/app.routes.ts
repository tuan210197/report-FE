import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';

import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProjectComponent } from './pages/project/project.component';
import { LoteryComponent } from './pages/lotery/lotery.component';
import { DailyReportComponent } from './pages/daily-report/daily-report.component';
import { WeeklyReportComponent } from './pages/weekly-report/weekly-report.component';
import { MonthlyReportComponent } from './pages/monthly-report/monthly-report.component';
import { AddProjectComponent } from './pages/add-project/add-project.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { FileUploadComponent } from './pages/file-upload/file-upload.component';



export const routes: Routes = [

    { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'project', component: ProjectComponent, canActivate: [AuthGuard] },
    { path: 'daily-report', component: DailyReportComponent, canActivate: [AuthGuard] },
    { path: 'weekly-report', component: WeeklyReportComponent, canActivate: [AuthGuard] },
    { path: 'monthly-report', component: MonthlyReportComponent, canActivate: [AuthGuard] },
    { path: 'lotery', component: LoteryComponent, canActivate: [AuthGuard] },
    { path: 'add-project', component: AddProjectComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [AuthGuard] },
    { path: 'files', component: FileUploadComponent, canActivate: [AuthGuard] } // Redirect mặc định

];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }