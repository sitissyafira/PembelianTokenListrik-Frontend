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
import { PublicTicketService } from './publicticket.service';
// State
import { AppState } from '../reducers';
import {
	PublicTicketActionTypes,
	PublicTicketPageRequested,
	PublicTicketPageLoaded,
	PublicTicketCreated,
	PublicTicketDeleted,
	RatingDeleted,
	PublicTicketUpdated,
	PublicTicketOnServerCreated,
	PublicTicketActionToggleLoading,
	PublicTicketPageToggleLoading,
	PublicTicketPageRequestedSPV,
	PublicTicketPageRequestedWfs,
	PublicTicketPageRequestedOpen,
	PublicTicketPageRequestedWfc,
	PublicTicketPageRequestedScheduled,
	PublicTicketPageRequestedRescheduled,
	PublicTicketPageRequestedDone,
	PublicTicketPageRating,
	PublicTicketPageRequestedWaitSurvey,
	PublicTicketPageRequestedSchSurvey,
	PublicTicketPageRequestedReject,
	PublicTicketPageRequestedSurveyDone,
} from './publicticket.action';
import { QueryPublicTicketModel } from './querypublicticket.model';


@Injectable()
export class PublicTicketEffect {
	showPageLoadingDistpatcher = new PublicTicketPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new PublicTicketPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new PublicTicketActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new PublicTicketActionToggleLoading({ isLoading: false });

	@Effect()
	loadPublicTicketPage$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequested>(PublicTicketActionTypes.PublicTicketPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getListPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageOpen$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedOpen>(PublicTicketActionTypes.PublicTicketPageOpen),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getOpenPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);


	@Effect()
	loadPublicTicketPageWfs$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedWfs>(PublicTicketActionTypes.PublicTicketPageWfs),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getWfsPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageWfc$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedWfc>(PublicTicketActionTypes.PublicTicketPageWfc),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getWfcPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageScheduled$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedScheduled>(PublicTicketActionTypes.PublicTicketPageScheduled),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getScheduledPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageRescheduled$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedRescheduled>(PublicTicketActionTypes.PublicTicketPageRescheduled),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getRescheduledPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageRating$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRating>(PublicTicketActionTypes.PublicTicketPageRating),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getPublicTicketRating(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// Add 4 Catogory

	@Effect()
	loadPublicTicketPageDone$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedDone>(PublicTicketActionTypes.PublicTicketPageDone),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getDonePublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// Add 4 Catogory

	// 1. Wait Survey
	@Effect()
	loadPublicTicketPageWaitSurvey$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedWaitSurvey>(PublicTicketActionTypes.PublicTicketPageWaitSurvey),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getWaitSurveyPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 2. Schedule Survey
	@Effect()
	loadPublicTicketPageSchSurvey$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedSchSurvey>(PublicTicketActionTypes.PublicTicketPageSchSurvey),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getScheduleSurveyPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 3. Reject
	@Effect()
	loadPublicTicketPageReject$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedReject>(PublicTicketActionTypes.PublicTicketPageReject),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getRejectPublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 3. Reject
	@Effect()
	loadPublicTicketPageSurveyDone$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedSurveyDone>(PublicTicketActionTypes.PublicTicketPageSurveyDone),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getSurveyDonePublicTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadPublicTicketPageSpv$ = this.actions$
		.pipe(
			ofType<PublicTicketPageRequestedSPV>(PublicTicketActionTypes.PublicTicketPageForSPV),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.publicTicket.getListPublicTicketSpv(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryPublicTicketModel = response[1];
				return new PublicTicketPageLoaded({
					publicTicket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deletePublicTicket$ = this.actions$
		.pipe(
			ofType<PublicTicketDeleted>(PublicTicketActionTypes.PublicTicketDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicTicket.deletePublicTicket(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteRating$ = this.actions$
		.pipe(
			ofType<RatingDeleted>(PublicTicketActionTypes.RatingDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicTicket.deleteRating(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updatePublicTicket = this.actions$
		.pipe(
			ofType<PublicTicketUpdated>(PublicTicketActionTypes.PublicTicketUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicTicket.updatePublicTicket(payload.publicTicket);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<PublicTicketOnServerCreated>(PublicTicketActionTypes.PublicTicketOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.publicTicket.createPublicTicket(payload.publicTicket).pipe(
					tap(res => {
						this.store.dispatch(new PublicTicketCreated({ publicTicket: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private publicTicket: PublicTicketService, private store: Store<AppState>) { }
}

