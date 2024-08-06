// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { FacilityModel } from './facility.model';
import { QueryFacilityModel } from './queryfacility.model';
// Models

export enum FacilityActionTypes {
	AllUsersRequested = '[Facility Module] All Facility Requested',
	AllUsersLoaded = '[Facility API] All Facility Loaded',
	FacilityOnServerCreated = '[Edit Facility Component] Facility On Server Created',
	FacilityCreated = '[Edit Facility Dialog] Facility Created',
	FacilityUpdated = '[Edit Facility Dialog] Facility Updated',
	FacilityDeleted = '[Facility List Page] Facility Deleted',
	FacilityPageRequested = '[Facility List Page] Facility Page Requested',
	FacilityPageLoaded = '[Facility API] Facility Page Loaded',
	FacilityPageCancelled = '[Facility API] Facility Page Cancelled',
	FacilityPageToggleLoading = '[Facility] Facility Page Toggle Loading',
	FacilityActionToggleLoading = '[Facility] Facility Action Toggle Loading'
}
export class FacilityOnServerCreated implements Action {
	readonly type = FacilityActionTypes.FacilityOnServerCreated;
	constructor(public payload: { facility: FacilityModel }) { }
}

export class FacilityCreated implements Action {
	readonly type = FacilityActionTypes.FacilityCreated;
	constructor(public payload: { facility: FacilityModel }) { }
}


export class FacilityUpdated implements Action {
	readonly type = FacilityActionTypes.FacilityUpdated;
	constructor(public payload: {
		partialFacility: Update<FacilityModel>,
		facility: FacilityModel
	}) { }
}

export class FacilityDeleted implements Action {
	readonly type = FacilityActionTypes.FacilityDeleted;

	constructor(public payload: { id: string }) {}
}

export class FacilityPageRequested implements Action {
	readonly type = FacilityActionTypes.FacilityPageRequested;
	constructor(public payload: { page: QueryFacilityModel }) { }
}

export class FacilityPageLoaded implements Action {
	readonly type = FacilityActionTypes.FacilityPageLoaded;
	constructor(public payload: { facility: FacilityModel[], totalCount: number, page: QueryFacilityModel  }) { }
}


export class FacilityPageCancelled implements Action {
	readonly type = FacilityActionTypes.FacilityPageCancelled;
}

export class FacilityPageToggleLoading implements Action {
	readonly type = FacilityActionTypes.FacilityPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class FacilityActionToggleLoading implements Action {
	readonly type = FacilityActionTypes.FacilityActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type FacilityActions = FacilityCreated
	| FacilityUpdated
	| FacilityDeleted
	| FacilityOnServerCreated
	| FacilityPageLoaded
	| FacilityPageCancelled
	| FacilityPageToggleLoading
	| FacilityPageRequested
	| FacilityActionToggleLoading;
