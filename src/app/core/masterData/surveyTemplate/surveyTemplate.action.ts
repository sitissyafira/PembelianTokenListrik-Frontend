import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { SurveyTemplateModel } from './surveyTemplate.model';
import { QuerySurveyTemplateModel } from './querysurveyTemplate.model';

export enum SurveyTemplateActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	SurveyTemplateOnServerCreated = '[Edit SurveyTemplate Component] SurveyTemplate On Server Created',
	SurveyTemplateCreated = '[Edit SurveyTemplate Dialog] SurveyTemplate Created',
	SurveyTemplateUpdated = '[Edit SurveyTemplate Dialog] SurveyTemplate Updated',
	SurveyTemplateDeleted = '[SurveyTemplate List Page] SurveyTemplate Deleted',
	SurveyTemplatePageRequested = '[SurveyTemplate List Page] SurveyTemplate Page Requested',
	SurveyTemplatePageLoaded = '[SurveyTemplate API] SurveyTemplate Page Loaded',
	SurveyTemplatePageCancelled = '[SurveyTemplate API] SurveyTemplate Page Cancelled',
	SurveyTemplatePageToggleLoading = '[SurveyTemplate] SurveyTemplate Page Toggle Loading',
	SurveyTemplateActionToggleLoading = '[SurveyTemplate] SurveyTemplate Action Toggle Loading'
}
export class SurveyTemplateOnServerCreated implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplateOnServerCreated;
	constructor(public payload: { surveyTemplate: SurveyTemplateModel }) { }
}
export class SurveyTemplateCreated implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplateCreated;
	constructor(public payload: { surveyTemplate: SurveyTemplateModel }) { }
}
export class SurveyTemplateUpdated implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplateUpdated;
	constructor(public payload: {
		partialSurveyTemplate: Update<SurveyTemplateModel>,
		surveyTemplate: SurveyTemplateModel
	}) { }
}
export class SurveyTemplateDeleted implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplateDeleted;

	constructor(public payload: { id: string }) {}
}
export class SurveyTemplatePageRequested implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplatePageRequested;
	constructor(public payload: { page: QuerySurveyTemplateModel }) { }
}
export class SurveyTemplatePageLoaded implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplatePageLoaded;
	constructor(public payload: { surveyTemplate: SurveyTemplateModel[], totalCount: number, page: QuerySurveyTemplateModel  }) { }
}
export class SurveyTemplatePageCancelled implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplatePageCancelled;
}
export class SurveyTemplatePageToggleLoading implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplatePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class SurveyTemplateActionToggleLoading implements Action {
	readonly type = SurveyTemplateActionTypes.SurveyTemplateActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type SurveyTemplateActions = SurveyTemplateCreated
	| SurveyTemplateUpdated
	| SurveyTemplateDeleted
	| SurveyTemplateOnServerCreated
	| SurveyTemplatePageLoaded
	| SurveyTemplatePageCancelled
	| SurveyTemplatePageToggleLoading
	| SurveyTemplatePageRequested
	| SurveyTemplateActionToggleLoading;
