import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { VendorService } from './vendor.service';
import { AppState } from '../../../core/reducers';
import {
	VendorActionTypes,
	VendorPageRequested,
	VendorPageLoaded,
	VendorCreated,
	VendorDeleted,
	VendorUpdated,
	VendorOnServerCreated,
	VendorActionToggleLoading,
	VendorPageToggleLoading
} from './vendor.action';
import { QueryVendorModel } from './queryvendor.model';


@Injectable()
export class VendorEffect {
	showPageLoadingDistpatcher = new VendorPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new VendorPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new VendorActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new VendorActionToggleLoading({ isLoading: false });

	@Effect()
	loadVendorPage$ = this.actions$
		.pipe(
			ofType<VendorPageRequested>(VendorActionTypes.VendorPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.vendor.getListVendor(payload.page)
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
				const lastQuery: QueryVendorModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new VendorPageLoaded({
					vendor: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new VendorPageLoaded({
						vendor: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteVendor$ = this.actions$
		.pipe(
			ofType<VendorDeleted>(VendorActionTypes.VendorDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.vendor.deleteVendor(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateVendor = this.actions$
		.pipe(
			ofType<VendorUpdated>(VendorActionTypes.VendorUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vendor.updateVendor(payload.vendor);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<VendorOnServerCreated>(VendorActionTypes.VendorOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.vendor.createVendor(payload.vendor).pipe(
					tap(res => {
						this.store.dispatch(new VendorCreated({ vendor: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private vendor: VendorService, private store: Store<AppState>) { }
}
