import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginInfo, LoginService } from './login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'endeca-mini';
  loginInfo: LoginInfo;
  constructor(private loginService: LoginService, private router: Router) {
    const loggedInService$ = this.loginService.getLoggedInSubject();
    loggedInService$.subscribe(info => {
      this.loginInfo = info;
    });
  }

  signOut() {
    this.loginService.logout();
    this.router.navigate(['']);
  }
  
}