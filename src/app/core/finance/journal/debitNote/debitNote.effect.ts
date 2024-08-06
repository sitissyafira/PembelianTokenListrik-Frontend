// AnguldebitNote
import { Injectable } from '@angular/core';
// RxJS
import { mergeMap, map, tap } from 'rxjs/operators';
import { Observable, defer, of, forkJoin } from 'rxjs';
// NGRX
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';
// CRUD
import { QueryResultsModel } from '../../../_base/crud';
// Services
import { DebitNoteService } from './debitNote.service';
// State
import { AppState } from '../../../reducers';
import {
	DebitNoteActionTypes,
	DebitNotePageRequested,
	DebitNotePageLoaded,
	DebitNoteCreated,
	DebitNoteDeleted,
	DebitNoteUpdated,
	DebitNoteOnServerCreated,
	DebitNoteActionToggleLoading,
	DebitNotePageToggleLoading
} from './debitNote.action';
import { QueryDebitNoteModel } from './querydebitNote.model';


@Injectable()
export class DebitNoteEffect {
	showPageLoadingDistpatcher = new DebitNotePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new DebitNotePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new DebitNoteActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new DebitNoteActionToggleLoading({ isLoading: false });

	@Effect()
	loadDebitNotePage$ = this.actions$
		.pipe(
			ofType<DebitNotePageRequested>(DebitNoteActionTypes.DebitNotePageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.debitNote.getListDebitNote(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryDebitNoteModel = response[1];
				return new DebitNotePageLoaded({
					debitNote: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);
	@Effect()
	deleteDebitNote$ = this.actions$
		.pipe(
			ofType<DebitNoteDeleted>(DebitNoteActionTypes.DebitNoteDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.debitNote.deleteDebitNote(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateDebitNote = this.actions$
		.pipe(
			ofType<DebitNoteUpdated>(DebitNoteActionTypes.DebitNoteUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.debitNote.updateDebitNote(payload.debitNote);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<DebitNoteOnServerCreated>(DebitNoteActionTypes.DebitNoteOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.debitNote.createDebitNote(payload.debitNote).pipe(
					tap(res => {
						this.store.dispatch(new DebitNoteCreated({ debitNote: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private debitNote: DebitNoteService, private store: Store<AppState>) { }
}
