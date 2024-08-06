// Angular
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../_base/crud';
// Services
import { EmergencyService } from './emergency.service';
// State
import { AppState } from '../reducers';
import {
	EmergencyActionTypes,
	EmergencyPageRequested,
	EmergencyPageLoaded,
	EmergencyCreated,
	EmergencyDeleted,
	EmergencyUpdated,
	EmergencyOnServerCreated,
	EmergencyActionToggleLoading,
	EmergencyPageToggleLoading
} from './emergency.action';
import { QueryEmergencyModel } from './queryemergency.model';

@Injectable()
export class EmergencyEffect {
	showPageLoadingDistpatcher = new EmergencyPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new EmergencyPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new EmergencyActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new EmergencyActionToggleLoading({ isLoading: false });

	@Effect()
	loadEmergencyPage$ = this.actions$
		.pipe(
			ofType<EmergencyPageRequested>(EmergencyActionTypes.EmergencyPageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.emergency.getListEmergency(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				const lastQuery: QueryEmergencyModel = response[1];
				return new EmergencyPageLoaded({
					emergency: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteEmergency$ = this.actions$
		.pipe(
			ofType<EmergencyDeleted>(EmergencyActionTypes.EmergencyDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.emergency.deleteEmergency(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateEmergency = this.actions$
		.pipe(
			ofType<EmergencyUpdated>(EmergencyActionTypes.EmergencyUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.emergency.updateEmergency(payload.emergency);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createEmergency$ = this.actions$
		.pipe(
			ofType<EmergencyOnServerCreated>(EmergencyActionTypes.EmergencyOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.emergency.createEmergency(payload.emergency).pipe(
					tap(res => {
						this.store.dispatch(new EmergencyCreated({ emergency: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private emergency: EmergencyService, private store: Store<AppState>) { }
}
