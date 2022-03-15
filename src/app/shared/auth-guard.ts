import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree
} from "@angular/router";
import { LoginService } from "../login/login.service";
  
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private loginService: LoginService,
        private router: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Promise<boolean> {
        
            console.log("AuthGuard ");
            const authInfo = this.loginService.getAuthInfo();
            console.log("authInfo ", authInfo);
            return authInfo.isLogged;
    }
}