// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { MasterModel } from './master.model';
import { QueryMasterModel } from './querymaster.model';
// Models

export enum MasterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	MasterOnServerCreated = '[Edit Master Component] Master On Server Created',
	MasterCreated = '[Edit Master Dialog] Master Created',
	MasterUpdated = '[Edit Master Dialog] Master Updated',
	MasterDeleted = '[Master List Page] Master Deleted',
	MasterPageRequested = '[Master List Page] Master Page Requested',
	MasterPageLoaded = '[Master API] Master Page Loaded',
	MasterPageCancelled = '[Master API] Master Page Cancelled',
	MasterPageToggleLoading = '[Master] Master Page Toggle Loading',
	MasterActionToggleLoading = '[Master] Master Action Toggle Loading'
}
export class MasterOnServerCreated implements Action {
	readonly type = MasterActionTypes.MasterOnServerCreated;
	constructor(public payload: { master: MasterModel }) { }
}

export class MasterCreated implements Action {
	readonly type = MasterActionTypes.MasterCreated;
	constructor(public payload: { master: MasterModel }) { }
}


export class MasterDeleted implements Action {
	readonly type = MasterActionTypes.MasterDeleted;

	constructor(public payload: { id: string }) { }
}

export class MasterUpdated implements Action {
	readonly type = MasterActionTypes.MasterUpdated;
	constructor(public payload: {
		partialMaster: Update<MasterModel>,
		master: MasterModel
	}) { }
}



export class MasterPageRequested implements Action {
	readonly type = MasterActionTypes.MasterPageRequested;
	constructor(public payload: { page: QueryMasterModel }) { }
}


export class MasterPageLoaded implements Action {
	readonly type = MasterActionTypes.MasterPageLoaded;
	constructor(public payload: { master: MasterModel[], totalCount: number, page: QueryMasterModel }) { }
}


export class MasterPageCancelled implements Action {
	readonly type = MasterActionTypes.MasterPageCancelled;
}

export class MasterPageToggleLoading implements Action {
	readonly type = MasterActionTypes.MasterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class MasterActionToggleLoading implements Action {
	readonly type = MasterActionTypes.MasterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type MasterActions = MasterCreated
	| MasterUpdated
	| MasterDeleted
	| MasterOnServerCreated
	| MasterPageLoaded
	| MasterPageCancelled
	| MasterPageToggleLoading
	| MasterPageRequested
	| MasterActionToggleLoading;
