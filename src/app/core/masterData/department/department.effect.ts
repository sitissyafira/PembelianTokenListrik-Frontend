import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { DepartmentService } from './department.service';
import { AppState } from '../../../core/reducers';
import {
	DepartmentActionTypes,
	DepartmentPageRequested,
	DepartmentPageLoaded,
	DepartmentCreated,
	DepartmentDeleted,
	DepartmentUpdated,
	DepartmentOnServerCreated,
	DepartmentActionToggleLoading,
	DepartmentPageToggleLoading
} from './department.action';
import { QueryDepartmentModel } from './querydepartment.model';


@Injectable()
export class DepartmentEffect {
	showPageLoadingDistpatcher = new DepartmentPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DepartmentPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DepartmentActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DepartmentActionToggleLoading({ isLoading: false });

	@Effect()
	loadDepartmentPage$ = this.actions$
		.pipe(
			ofType<DepartmentPageRequested>(DepartmentActionTypes.DepartmentPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.department.getListDepartment(payload.page)
				.pipe(
					catchError (err =>{
						return throwError(err);
					}),
					catchError(err => {
						return of (err)
					})
				);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map((response : any ) => {
				const lastQuery: QueryDepartmentModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new DepartmentPageLoaded({
					department: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new DepartmentPageLoaded({
						department: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteDepartment$ = this.actions$
		.pipe(
			ofType<DepartmentDeleted>(DepartmentActionTypes.DepartmentDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.department.deleteDepartment(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDepartment = this.actions$
		.pipe(
			ofType<DepartmentUpdated>(DepartmentActionTypes.DepartmentUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.department.updateDepartment(payload.department);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<DepartmentOnServerCreated>(DepartmentActionTypes.DepartmentOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.department.createDepartment(payload.department).pipe(
					tap(res => {
						this.store.dispatch(new DepartmentCreated({ department: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private department: DepartmentService, private store: Store<AppState>) { }
}
