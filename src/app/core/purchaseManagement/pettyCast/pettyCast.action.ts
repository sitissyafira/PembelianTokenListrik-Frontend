import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PettyCastModel } from './pettyCast.model';
import { QueryPettyCastModel } from './querypettyCast.model';

export enum PettyCastActionTypes {
	AllUsersRequested = '[PettyCast Module] All Petty Cast Requested',
	AllUsersLoaded = '[PettyCast API] All Petty Cast Loaded',
	PettyCastOnServerCreated = '[Edit PettyCast Component] PettyCast On Server Created',
	PettyCastCreated = '[Edit PettyCast Dialog] PettyCast Created',
	PettyCastUpdated = '[Edit PettyCast Dialog] PettyCast Updated',
	PettyCastDeleted = '[PettyCast List Page] PettyCast Deleted',
	PettyCastPageRequested = '[PettyCast List Page] PettyCast Page Requested',
	PettyCastPageLoaded = '[PettyCast API] PettyCast Page Loaded',
	PettyCastPageCancelled = '[PettyCast API] PettyCast Page Cancelled',
	PettyCastPageToggleLoading = '[PettyCast] PettyCast Page Toggle Loading',
	PettyCastActionToggleLoading = '[PettyCast] PettyCast Action Toggle Loading'
}
export class PettyCastOnServerCreated implements Action {
	readonly type = PettyCastActionTypes.PettyCastOnServerCreated;
	constructor(public payload: { pettyCast: PettyCastModel }) { }
}
export class PettyCastCreated implements Action {
	readonly type = PettyCastActionTypes.PettyCastCreated;
	constructor(public payload: { pettyCast: PettyCastModel }) { }
}
export class PettyCastUpdated implements Action {
	readonly type = PettyCastActionTypes.PettyCastUpdated;
	constructor(public payload: {
		partialPettyCast: Update<PettyCastModel>,
		pettyCast: PettyCastModel
	}) { }
}
export class PettyCastDeleted implements Action {
	readonly type = PettyCastActionTypes.PettyCastDeleted;

	constructor(public payload: { id: string }) {}
}
export class PettyCastPageRequested implements Action {
	readonly type = PettyCastActionTypes.PettyCastPageRequested;
	constructor(public payload: { page: QueryPettyCastModel }) { }
}
export class PettyCastPageLoaded implements Action {
	readonly type = PettyCastActionTypes.PettyCastPageLoaded;
	constructor(public payload: { pettyCast: PettyCastModel[], totalCount: number, page: QueryPettyCastModel  }) { }
}
export class PettyCastPageCancelled implements Action {
	readonly type = PettyCastActionTypes.PettyCastPageCancelled;
}
export class PettyCastPageToggleLoading implements Action {
	readonly type = PettyCastActionTypes.PettyCastPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class PettyCastActionToggleLoading implements Action {
	readonly type = PettyCastActionTypes.PettyCastActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type PettyCastActions = PettyCastCreated
	| PettyCastUpdated
	| PettyCastDeleted
	| PettyCastOnServerCreated
	| PettyCastPageLoaded
	| PettyCastPageCancelled
	| PettyCastPageToggleLoading
	| PettyCastPageRequested
	| PettyCastActionToggleLoading;
