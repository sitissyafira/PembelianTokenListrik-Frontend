// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PkgsModel } from './pkgs.model';
import { QueryPkgsModel } from './querypkgs.model';
// Models

export enum PkgsActionTypes {
	AllUsersRequested = '[Pkgs Module] All Pkgs Requested',
	AllUsersLoaded = '[Pkgs API] All Pkgs Loaded',
	PkgsOnServerCreated = '[Edit Pkgs Component] Pkgs On Server Created',
	PkgsCreated = '[Edit Pkgs Dialog] Pkgs Created',
	PkgsUpdated = '[Edit Pkgs Dialog] Pkgs Updated',
	PkgsDeleted = '[Pkgs List Page] Pkgs Deleted',
	PkgsPageRequested = '[Pkgs List Page] Pkgs Page Requested',
	PkgsPageLoaded = '[Pkgs API] Pkgs Page Loaded',
	PkgsPageCancelled = '[Pkgs API] Pkgs Page Cancelled',
	PkgsPageToggleLoading = '[Pkgs] Pkgs Page Toggle Loading',
	PkgsActionToggleLoading = '[Pkgs] Pkgs Action Toggle Loading'
}
export class PkgsOnServerCreated implements Action {
	readonly type = PkgsActionTypes.PkgsOnServerCreated;
	constructor(public payload: { pkgs: PkgsModel }) { }
}

export class PkgsCreated implements Action {
	readonly type = PkgsActionTypes.PkgsCreated;
	constructor(public payload: { pkgs: PkgsModel }) { }
}


export class PkgsUpdated implements Action {
	readonly type = PkgsActionTypes.PkgsUpdated;
	constructor(public payload: {
		partialPkgs: Update<PkgsModel>,
		pkgs: PkgsModel
	}) { }
}

export class PkgsDeleted implements Action {
	readonly type = PkgsActionTypes.PkgsDeleted;

	constructor(public payload: { id: string }) {}
}

export class PkgsPageRequested implements Action {
	readonly type = PkgsActionTypes.PkgsPageRequested;
	constructor(public payload: { page: QueryPkgsModel }) { }
}

export class PkgsPageLoaded implements Action {
	readonly type = PkgsActionTypes.PkgsPageLoaded;
	constructor(public payload: { pkgs: PkgsModel[], totalCount: number, page: QueryPkgsModel  }) { }
}


export class PkgsPageCancelled implements Action {
	readonly type = PkgsActionTypes.PkgsPageCancelled;
}

export class PkgsPageToggleLoading implements Action {
	readonly type = PkgsActionTypes.PkgsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PkgsActionToggleLoading implements Action {
	readonly type = PkgsActionTypes.PkgsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PkgsActions = PkgsCreated
	| PkgsUpdated
	| PkgsDeleted
	| PkgsOnServerCreated
	| PkgsPageLoaded
	| PkgsPageCancelled
	| PkgsPageToggleLoading
	| PkgsPageRequested
	| PkgsActionToggleLoading;
