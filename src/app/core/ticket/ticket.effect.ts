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
import { TicketService } from './ticket.service';
// State
import { AppState } from '../../core/reducers';
import {
	TicketActionTypes,
	TicketPageRequested,
	TicketPageLoaded,
	TicketCreated,
	TicketDeleted,
	RatingDeleted,
	TicketUpdated,
	TicketOnServerCreated,
	TicketActionToggleLoading,
	TicketPageToggleLoading,
	TicketPageRequestedSPV,
	TicketPageRequestedWfs,
	TicketPageRequestedOpen,
	TicketPageRequestedWfc,
	TicketPageRequestedScheduled,
	TicketPageRequestedRescheduled,
	TicketPageRequestedDone,
	TicketPageRating,
	TicketPageRequestedWaitSurvey,
	TicketPageRequestedSchSurvey,
	TicketPageRequestedReject,
	TicketPageRequestedSurveyDone,
} from './ticket.action';
import { QueryTicketModel } from './queryticket.model';


@Injectable()
export class TicketEffect {
	showPageLoadingDistpatcher = new TicketPageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new TicketPageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new TicketActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new TicketActionToggleLoading({ isLoading: false });

	@Effect()
	loadTicketPage$ = this.actions$
		.pipe(
			ofType<TicketPageRequested>(TicketActionTypes.TicketPageRequested),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getListTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageOpen$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedOpen>(TicketActionTypes.TicketPageOpen),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getOpenTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);


	@Effect()
	loadTicketPageWfs$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedWfs>(TicketActionTypes.TicketPageWfs),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getWfsTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageWfc$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedWfc>(TicketActionTypes.TicketPageWfc),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getWfcTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageScheduled$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedScheduled>(TicketActionTypes.TicketPageScheduled),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getScheduledTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageRescheduled$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedRescheduled>(TicketActionTypes.TicketPageRescheduled),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getRescheduledTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageRating$ = this.actions$
		.pipe(
			ofType<TicketPageRating>(TicketActionTypes.TicketPageRating),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getTicketRating(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// Add 4 Catogory

	@Effect()
	loadTicketPageDone$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedDone>(TicketActionTypes.TicketPageDone),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getDoneTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// Add 4 Catogory

	// 1. Wait Survey
	@Effect()
	loadTicketPageWaitSurvey$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedWaitSurvey>(TicketActionTypes.TicketPageWaitSurvey),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getWaitSurveyTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 2. Schedule Survey
	@Effect()
	loadTicketPageSchSurvey$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedSchSurvey>(TicketActionTypes.TicketPageSchSurvey),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getScheduleSurveyTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 3. Reject
	@Effect()
	loadTicketPageReject$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedReject>(TicketActionTypes.TicketPageReject),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getRejectTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	// 3. Reject
	@Effect()
	loadTicketPageSurveyDone$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedSurveyDone>(TicketActionTypes.TicketPageSurveyDone),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getSurveyDoneTicket(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	loadTicketPageSpv$ = this.actions$
		.pipe(
			ofType<TicketPageRequestedSPV>(TicketActionTypes.TicketPageForSPV),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.ticket.getListTicketSpv(payload.page);
				const lastQuery = of(payload.page);
				return forkJoin(requestToServer, lastQuery);
			}),
			map(response => {
				let res: { errorMessage: string; totalCount: any; items: any };
				const result: QueryResultsModel = { items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data: [] };
				const lastQuery: QueryTicketModel = response[1];
				return new TicketPageLoaded({
					ticket: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}),
		);

	@Effect()
	deleteTicket$ = this.actions$
		.pipe(
			ofType<TicketDeleted>(TicketActionTypes.TicketDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ticket.deleteTicket(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	deleteRating$ = this.actions$
		.pipe(
			ofType<RatingDeleted>(TicketActionTypes.RatingDeleted),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ticket.deleteRating(payload.id);
			}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateTicket = this.actions$
		.pipe(
			ofType<TicketUpdated>(TicketActionTypes.TicketUpdated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ticket.updateTicket(payload.ticket);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<TicketOnServerCreated>(TicketActionTypes.TicketOnServerCreated),
			mergeMap(({ payload }) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.ticket.createTicket(payload.ticket).pipe(
					tap(res => {
						this.store.dispatch(new TicketCreated({ ticket: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private ticket: TicketService, private store: Store<AppState>) { }
}

