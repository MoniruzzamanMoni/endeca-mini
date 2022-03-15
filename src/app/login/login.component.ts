import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  

  constructor(private loginService: LoginService, private router: Router) { 
    const loggedInSubject$ = this.loginService.getLoggedInSubject();
    loggedInSubject$.subscribe(info => {
      if(info.isLogged && info.role === 'admin'){
        this.router.navigate(['admin']);
      }
    });
  }

  ngOnInit(): void {
  }

  signIn(): void {
    console.log('username: ', this.username);
    console.log('password: ', this.password);
    this.loginService.login(this.username, this.password);
  }

}
