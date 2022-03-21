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
import { TopicSearchModule, TopicService } from './topic-search/topic-search.module';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InitTopicTreeExposeService } from './topic-search/service/topic.service';
import { TreeModule } from 'primeng/tree';


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
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    RouterModule.forRoot(routes, {useHash: true}),
    EndecapodModule,
    TopicSearchModule,
    TreeModule,
    NgbModule
  ],
  providers: [EndecapodService, LoginService, AuthGuard, TopicService, InitTopicTreeExposeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
