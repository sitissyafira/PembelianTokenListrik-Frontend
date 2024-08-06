// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { Observable, defer, of, forkJoin, throwError } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../_base/crud';
// Services
import { PackagesService } from './packages.service';
// State
import { AppState } from '../../../core/reducers';
import {
	PackagesActionTypes,
	PackagesPageRequested,
	PackagesPageLoaded,
	PackagesCreated,
	PackagesDeleted,
	PackagesUpdated,
	PackagesOnServerCreated,
	PackagesActionToggleLoading,
	PackagesPageToggleLoading,
	PackagesPageLafRequested,
} from './packages.action';
import { QueryPackagesModel } from './querypackages.model';


@Injectable()
export class PackagesEffect {
	showPageLoadingDistpatcher = new PackagesPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PackagesPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PackagesActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PackagesActionToggleLoading({ isLoading: false });

	@Effect()
	loadPackagesPage$ = this.actions$
		.pipe(
			ofType<PackagesPageRequested>(PackagesActionTypes.PackagesPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.packages.getListPackages(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QueryPackagesModel = response[1];
				// if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };

				return new PackagesPageLoaded({
					packages: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
				// }else {
				// 	const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
				// 		return new PackagesPageLoaded({
				// 			packages: result.items,
				// 			totalCount: result.totalCount,
				// 			page: lastQuery
				// 		});
				// 	}
			}),
		);

	@Effect()
	loadPackagesPageLaf$ = this.actions$
		.pipe(
			ofType<PackagesPageLafRequested>(PackagesActionTypes.PackagesPageLafRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.packages.getListLostFoundPackages(payload.page)
					.pipe(
						catchError(err => {
							return throwError(err);
						}),
						catchError(err => {
							return of(err)
						})
					);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response: any) => {
				const lastQuery: QueryPackagesModel = response[1];
				// if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };

				return new PackagesPageLoaded({
					packages: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
				// }else {
				// 	const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
				// 		return new PackagesPageLoaded({
				// 			packages: result.items,
				// 			totalCount: result.totalCount,
				// 			page: lastQuery
				// 		});
				// 	}
			}),
		);

	@Effect()
	deletePackages$ = this.actions$
		.pipe(
			ofType<PackagesDeleted>(PackagesActionTypes.PackagesDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.packages.deletePackages(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePackages = this.actions$
		.pipe(
			ofType<PackagesUpdated>(PackagesActionTypes.PackagesUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.packages.updatePackages(payload.packages);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);
	@Effect()
	createPackages$ = this.actions$
		.pipe(
			ofType<PackagesOnServerCreated>(PackagesActionTypes.PackagesOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.packages.createPackages(payload.packages).pipe(
					tap(res => {
						this.store.dispatch(new PackagesCreated({ packages: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private packages: PackagesService, private store: Store<AppState>) { }
}
