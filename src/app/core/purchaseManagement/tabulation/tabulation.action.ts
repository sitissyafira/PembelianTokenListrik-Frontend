import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { TabulationModel } from './tabulation.model';
import { QueryTabulationModel } from './querytabulation.model';

export enum TabulationActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TabulationOnServerCreated = '[Edit Tabulation Component] Tabulation On Server Created',
	TabulationCreated = '[Edit Tabulation Dialog] Tabulation Created',
	TabulationUpdated = '[Edit Tabulation Dialog] Tabulation Updated',
	TabulationDeleted = '[Tabulation List Page] Tabulation Deleted',
	TabulationPageRequested = '[Tabulation List Page] Tabulation Page Requested',
	TabulationPageLoaded = '[Tabulation API] Tabulation Page Loaded',
	TabulationPageCancelled = '[Tabulation API] Tabulation Page Cancelled',
	TabulationPageToggleLoading = '[Tabulation] Tabulation Page Toggle Loading',
	TabulationActionToggleLoading = '[Tabulation] Tabulation Action Toggle Loading'
}
export class TabulationOnServerCreated implements Action {
	readonly type = TabulationActionTypes.TabulationOnServerCreated;
	constructor(public payload: { tabulation: TabulationModel }) { }
}
export class TabulationCreated implements Action {
	readonly type = TabulationActionTypes.TabulationCreated;
	constructor(public payload: { tabulation: TabulationModel }) { }
}
export class TabulationUpdated implements Action {
	readonly type = TabulationActionTypes.TabulationUpdated;
	constructor(public payload: {
		partialTabulation: Update<TabulationModel>,
		tabulation: TabulationModel
	}) { }
}
export class TabulationDeleted implements Action {
	readonly type = TabulationActionTypes.TabulationDeleted;

	constructor(public payload: { id: string }) {}
}
export class TabulationPageRequested implements Action {
	readonly type = TabulationActionTypes.TabulationPageRequested;
	constructor(public payload: { page: QueryTabulationModel }) { }
}
export class TabulationPageLoaded implements Action {
	readonly type = TabulationActionTypes.TabulationPageLoaded;
	constructor(public payload: { tabulation: TabulationModel[], totalCount: number, page: QueryTabulationModel  }) { }
}
export class TabulationPageCancelled implements Action {
	readonly type = TabulationActionTypes.TabulationPageCancelled;
}
export class TabulationPageToggleLoading implements Action {
	readonly type = TabulationActionTypes.TabulationPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class TabulationActionToggleLoading implements Action {
	readonly type = TabulationActionTypes.TabulationActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type TabulationActions = TabulationCreated
	| TabulationUpdated
	| TabulationDeleted
	| TabulationOnServerCreated
	| TabulationPageLoaded
	| TabulationPageCancelled
	| TabulationPageToggleLoading
	| TabulationPageRequested
	| TabulationActionToggleLoading;
