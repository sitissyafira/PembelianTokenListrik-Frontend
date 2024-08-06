// Angular
import { Injectable } from "@angular/core";
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
} from "@angular/router";
// RxJS
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
// NGRX
import { select, Store } from "@ngrx/store";
// Auth reducers and selectors
import { AppState } from "../../../core/reducers/";
import {
	currentUser,
	currentUserRoleIds,
	isLoggedIn,
} from "../_selectors/auth.selectors";
import { AuthService } from "../_services";
import { User } from "../index";
import * as jwt_decode from "jwt-decode";
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private store: Store<AppState>,
		private router: Router,
		private authenticationService: AuthService
	) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean> {
		//const currentUser = this.authenticationService.currentUserValue;
		const expectedRole = route.data.expectedRole;
		//const token = currentUser !== null ? currentUser.token : null;
		//const tokenPayload = jwt_decode(token);
		return this.store.pipe(
			select(isLoggedIn),
			tap((loggedIn) => {
				// return this.checkUserLogin(loggedIn);
				if (!loggedIn) {
					this.router.navigateByUrl("/auth/login");
				}
				this.store.pipe(select(currentUser)).subscribe((user) => {
					if (user) {
						// console.log(expectedRole.indexOf(user.role));
						localStorage.setItem("user", user._id);

						if(!expectedRole.includes(user.role)) {
							this.router.navigateByUrl("/dashboard");							
						}
					}
				});
				/*if (!currentUser || tokenPayload.role !== expectedRole) {
					this.router.navigate(["/auth/login"]);
					return false;
				}
				return true;*/
			})
		);
	}
}
