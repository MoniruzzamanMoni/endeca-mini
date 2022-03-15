import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  loggedInSubject$ = new BehaviorSubject({isLogged: false, role: 'user'});
  loginInfo: LoginInfo;

  
  constructor() {
    this.loginInfo = {isLogged: false, role: 'user'};
    this.loggedInSubject$.subscribe(res => {
      this.loginInfo = res;
    });
  }

  login(username: string, password: string) {
    if(username === 'admin' && password === 'admin') {
      this.loggedInSubject$.next({isLogged: true, role: 'admin'});
    }
  }

  logout() {
    console.log("logout");
    this.loggedInSubject$.next({isLogged: false, role: 'user'});
  }

  getAuthInfo(): LoginInfo {
    return this.loginInfo;
  }

  getLoggedInSubject(): Observable<LoginInfo> {
    return this.loggedInSubject$.asObservable();
  }

}

export class LoginInfo {
  isLogged: boolean;
  role: string;
}
