// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { EngineerModel } from './engineer.model';
// Models
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';
import {QueryEngineerModel} from './queryengineer.model';
export enum EngineerActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	EngineerOnServerCreated = '[Edit Engineer Component] Engineer On Server Created',
	EngineerCreated = '[Edit Engineer Dialog] Engineer Created',
	EngineerUpdated = '[Edit Engineer Dialog] Engineer Updated',
	EngineerDeleted = '[Engineer List Page] Engineer Deleted',
	EngineerPageRequested = '[Engineer List Page] Engineer Page Requested',
	EngineerPageLoaded = '[Engineer API] Engineer Page Loaded',
	EngineerPageCancelled = '[Engineer API] Engineer Page Cancelled',
	EngineerPageToggleLoading = '[Engineer] Engineer Page Toggle Loading',
	EngineerActionToggleLoading = '[Engineer] Engineer Action Toggle Loading'
}
export class EngineerOnServerCreated implements Action {
	readonly type = EngineerActionTypes.EngineerOnServerCreated;
	constructor(public payload: { engineer: EngineerModel }) { }
}

export class EngineerCreated implements Action {
	readonly type = EngineerActionTypes.EngineerCreated;
	constructor(public payload: { engineer: EngineerModel }) { }
}


export class EngineerUpdated implements Action {
	readonly type = EngineerActionTypes.EngineerUpdated;
	constructor(public payload: {
		partialEngineer: Update<EngineerModel>,
		engineer: EngineerModel
	}) { }
}

export class EngineerDeleted implements Action {
	readonly type = EngineerActionTypes.EngineerDeleted;

	constructor(public payload: { id: string }) {}
}

export class EngineerPageRequested implements Action {
	readonly type = EngineerActionTypes.EngineerPageRequested;
	constructor(public payload: { page: QueryEngineerModel }) { }
}

export class EngineerPageLoaded implements Action {
	readonly type = EngineerActionTypes.EngineerPageLoaded;
	constructor(public payload: { engineer: EngineerModel[], totalCount: number, page: QueryEngineerModel  }) { }
}

export class EngineerPageCancelled implements Action {
	readonly type = EngineerActionTypes.EngineerPageCancelled;
}

export class EngineerPageToggleLoading implements Action {
	readonly type = EngineerActionTypes.EngineerPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class EngineerActionToggleLoading implements Action {
	readonly type = EngineerActionTypes.EngineerActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type EngineerActions = EngineerCreated
	| EngineerUpdated
	| EngineerDeleted
	| EngineerOnServerCreated
	| EngineerPageLoaded
	| EngineerPageCancelled
	| EngineerPageToggleLoading
	| EngineerPageRequested
	| EngineerActionToggleLoading;
