import { Injectable } from '@angular/core';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { of, forkJoin, throwError } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store} from '@ngrx/store';
import { QueryResultsModel } from '../../_base/crud';
import { SurveyTemplateService } from './surveyTemplate.service';
import { AppState } from '../../reducers';
import {
	SurveyTemplateActionTypes,
	SurveyTemplatePageRequested,
	SurveyTemplatePageLoaded,
	SurveyTemplateCreated,
	SurveyTemplateDeleted,
	SurveyTemplateUpdated,
	SurveyTemplateOnServerCreated,
	SurveyTemplateActionToggleLoading,
	SurveyTemplatePageToggleLoading
} from './surveyTemplate.action';
import { QuerySurveyTemplateModel } from './querysurveyTemplate.model';


@Injectable()
export class SurveyTemplateEffect {
	showPageLoadingDistpatcher = new SurveyTemplatePageToggleLoading({ isLoading: true });
	hidePageLoadingDistpatcher = new SurveyTemplatePageToggleLoading({ isLoading: false });

	showActionLoadingDistpatcher = new SurveyTemplateActionToggleLoading({ isLoading: true });
	hideActionLoadingDistpatcher = new SurveyTemplateActionToggleLoading({ isLoading: false });

	@Effect()
	loadSurveyTemplatePage$ = this.actions$
		.pipe(
			ofType<SurveyTemplatePageRequested>(SurveyTemplateActionTypes.SurveyTemplatePageRequested),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showPageLoadingDistpatcher);
				const requestToServer = this.surveyTemplate.getListSurveyTemplate(payload.page)
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
				const lastQuery: QuerySurveyTemplateModel = response[1];
				if(response[0].status && response[0].status === "success"){
				const result: QueryResultsModel = {items: response[0].data, totalCount: response[0].totalCount, errorMessage: "", data:[] };
				return new SurveyTemplatePageLoaded({
					surveyTemplate: result.items,
					totalCount: result.totalCount,
					page: lastQuery
				});
			}else {
				const result: QueryResultsModel = { items: [], totalCount: 0, errorMessage: "", data: [] };
					return new SurveyTemplatePageLoaded({
						surveyTemplate: result.items,
						totalCount: result.totalCount,
						page: lastQuery
					});
				}
			}),
		);

	@Effect()
	deleteSurveyTemplate$ = this.actions$
		.pipe(
			ofType<SurveyTemplateDeleted>(SurveyTemplateActionTypes.SurveyTemplateDeleted),
			mergeMap(( { payload } ) => {
					this.store.dispatch(this.showActionLoadingDistpatcher);
					return this.surveyTemplate.deleteSurveyTemplate(payload.id);
				}
			),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	updateSurveyTemplate = this.actions$
		.pipe(
			ofType<SurveyTemplateUpdated>(SurveyTemplateActionTypes.SurveyTemplateUpdated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.surveyTemplate.updateSurveyTemplate(payload.surveyTemplate);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	@Effect()
	createBlock$ = this.actions$
		.pipe(
			ofType<SurveyTemplateOnServerCreated>(SurveyTemplateActionTypes.SurveyTemplateOnServerCreated),
			mergeMap(( { payload } ) => {
				this.store.dispatch(this.showActionLoadingDistpatcher);
				return this.surveyTemplate.createSurveyTemplate(payload.surveyTemplate).pipe(
					tap(res => {
						this.store.dispatch(new SurveyTemplateCreated({ surveyTemplate: res }));
					})
				);
			}),
			map(() => {
				return this.hideActionLoadingDistpatcher;
			}),
		);

	constructor(private actions$: Actions, private surveyTemplate: SurveyTemplateService, private store: Store<AppState>) { }
}
