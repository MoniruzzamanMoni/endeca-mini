import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { EndecapodModule, EndecapodService } from '@ibfd/endecapod';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { LoginService } from './login/login.service';
import { AuthGuard } from './shared/auth-guard';


const routes: Routes = [
  {
    path: '',
    component: UserComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    UserComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    RouterModule.forRoot(routes, {useHash: true}),
    EndecapodModule
  ],
  providers: [EndecapodService, LoginService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
