import { Injectable } from "@angular/core";
import {
	HttpClient,
	HttpHeaders,
	HttpParams,
	HttpUrlEncodingCodec,
} from "@angular/common/http";
import { Observable, of, BehaviorSubject } from "rxjs";
import { User } from "../_models/user.model";
import { Permission } from "../_models/permission.model";
import { Role } from "../_models/role.model";
import { catchError, map } from "rxjs/operators";
import { QueryParamsModel, QueryResultsModel } from "../../_base/crud";
import { environment } from "../../../../environments/environment";
import { Router } from "@angular/router";
import * as FileSaver from 'file-saver';

// const API_USERS_URL = 'https://helpdeskrenol.herokuapp.com/api/user';
const API_USERS_URL = `${environment.baseAPI}/api/user`;
const API_PERMISSION_URL = "api/permissions";
const API_ROLES_URL = "api/roles";

const API_USER_EXPORT_URL = `${environment.baseAPI}/api/excel/users/export`;

@Injectable()
export class AuthService {
	private currentUserSubject: BehaviorSubject<User>;
	public currentUser: Observable<User>;
	constructor(private http: HttpClient) {
		this.currentUserSubject = new BehaviorSubject<User>(
			JSON.parse(localStorage.getItem("currentUser"))
		);
		this.currentUser = this.currentUserSubject.asObservable();
	}
	// Authentication/Authorization
	login(username: string, password: string): Observable<User> {
		return this.http
			.post<User>(`${API_USERS_URL}/login`, { username, password })
			.pipe(
				map((user) => {
					// login successful if there's a jwt token in the response
					if (user && user.role) {
						// store user details and jwt token in local storage to keep user logged in between page refreshes
						localStorage.setItem(
							"currentUser",
							JSON.stringify(user)
						);
						this.currentUserSubject.next(user);

					}
					return user;

				})
			);
	}

	public get currentUserValue(): User {
		console.log(this.currentUserSubject);
		return this.currentUserSubject.value;
	}

	getUserByToken(): Observable<User> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Authorization", "Bearer " + userToken);
		return this.http
			.get<User>(API_USERS_URL, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					// @ts-ignore
					return res.data;
				})
			);
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http
			.post<User>(API_USERS_URL, user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError((err) => {
					return null;
				})
			);
	}

	/*
	 * Submit forgot password request
	 *
	 * @param {string} email
	 * @returns {Observable<any>}
	 */
	public requestPassword(email: string): Observable<any> {
		return this.http
			.get(API_USERS_URL + "/forgot?=" + email)
			.pipe(catchError(this.handleError("forgot-password", [])));
	}

	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(`${API_USERS_URL}`);
	}

	getUserById(userId: number): Observable<User> {
		return this.http.get<User>(API_USERS_URL + `/${userId}`);
	}
	findUserById(userId: number): Observable<any> {
		return this.http.get<User>(API_USERS_URL + `/customer/${userId}`);
	}

	// DELETE => delete the user from the server
	deleteUser(userId: string) {
		const url = `${API_USERS_URL}/${userId}`;
		return this.http.delete(url);
	}

	// UPDATE => PUT: update the user on the server
	// tslint:disable-next-line:variable-name
	updateUser(_user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		console.log(_user.userUnits.length, "_user.userUnits.length");

		return this.http.patch(
			`${API_USERS_URL}/${_user._id}`,
			{
				username: _user.username,
				first_name: _user.first_name,
				last_name: _user.last_name,
				role: _user.role,
				password: _user.password,
				engineer: _user.engineer,
				tenant: _user.tenant,
				unit: _user.userUnits.length === 1 ? _user.userUnits[0] : undefined,
				userUnits: _user.userUnits.length > 1 ? _user.userUnits : undefined,
			},
			{ headers: httpHeaders }
		);
	}

	// CREATE =>  POST: add a new user to the server
	createUser(user: User): Observable<User> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<User>(`${API_USERS_URL}/add`, user, {
			headers: httpHeaders,
		});
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		// let params = new HttpParams({
		// 	fromObject: queryParams
		// });
		// @ts-ignore
		let options = {
			param: JSON.stringify(queryParams),
		};
		let params = new URLSearchParams();
		for (let key in options) {
			params.set(key, options[key]);
		}
		return this.http.get<QueryResultsModel>(
			API_USERS_URL + "/list?" + params,
			{ headers: httpHeaders }
		);
	}

	exportExcel() {
		return FileSaver.saveAs(`${API_USER_EXPORT_URL}`, "export-user management.xlsx");
	}


	// Permission
	getAllPermissions(): Observable<Permission[]> {
		return this.http.get<Permission[]>(API_PERMISSION_URL);
	}

	getRolePermissions(roleId: number): Observable<Permission[]> {
		return this.http.get<Permission[]>(
			API_PERMISSION_URL + "/getRolePermission?=" + roleId
		);
	}


	// Roles
	getAllRoles(): Observable<Role[]> {
		return this.http.get<Role[]>(API_ROLES_URL);
	}

	getRoleById(roleId: number): Observable<Role> {
		return this.http.get<Role>(API_ROLES_URL + `/${roleId}`);
	}

	// CREATE =>  POST: add a new role to the server
	createRole(role: Role): Observable<Role> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<Role>(API_ROLES_URL, role, {
			headers: httpHeaders,
		});
	}

	// UPDATE => PUT: update the role on the server
	updateRole(role: Role): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.put(API_ROLES_URL, role, { headers: httpHeaders });
	}

	// DELETE => delete the role from the server
	deleteRole(roleId: number): Observable<Role> {
		const url = `${API_ROLES_URL}/${roleId}`;
		return this.http.delete<Role>(url);
	}

	// Check Role Before deletion
	isRoleAssignedToUsers(roleId: number): Observable<boolean> {
		return this.http.get<boolean>(
			API_ROLES_URL + "/checkIsRollAssignedToUser?roleId=" + roleId
		);
	}

	findRoles(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		// This code imitates server calls
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.post<QueryResultsModel>(
			API_ROLES_URL + "/findRoles",
			queryParams,
			{ headers: httpHeaders }
		);
	}


	getUserUnitList(params): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set("Content-Type", "application/json");
		return this.http.get<QueryResultsModel>(`${API_USERS_URL}/select/user-units?userUnits=${params.unit}`,);
	}




	/*
		 * Handle Http operation that failed.
		 * Let the app continue.
		 *
=======
	public get currentUserValue(): User {
		console.log(this.currentUserSubject);
		return this.currentUserSubject.value;
	}

	/*
	 * Handle Http operation that failed.
	 * Let the app continue.
	 *
>>>>>>> 44df133dae71df5b430d783552653078d8bed2c9
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = "operation", result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
