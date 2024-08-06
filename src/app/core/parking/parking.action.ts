// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ParkingModel } from './parking.model';
import { QueryParkingModel } from './queryparking.model';
// Models

export enum ParkingActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ParkingOnServerCreated = '[Edit Parking Component] Parking On Server Created',
	ParkingCreated = '[Edit Parking Dialog] Parking Created',
	ParkingUpdated = '[Edit Parking Dialog] Parking Updated',
	ParkingDeleted = '[Parking List Page] Parking Deleted',
	ParkingPageRequested = '[Parking List Page] Parking Page Requested',
	ParkingPageLoaded = '[Parking API] Parking Page Loaded',
	ParkingPageCancelled = '[Parking API] Parking Page Cancelled',
	ParkingPageToggleLoading = '[Parking] Parking Page Toggle Loading',
	ParkingActionToggleLoading = '[Parking] Parking Action Toggle Loading'
}
export class ParkingOnServerCreated implements Action {
	readonly type = ParkingActionTypes.ParkingOnServerCreated;
	constructor(public payload: { parking: ParkingModel }) { }
}

export class ParkingCreated implements Action {
	readonly type = ParkingActionTypes.ParkingCreated;
	constructor(public payload: { parking: ParkingModel }) { }
}


export class ParkingUpdated implements Action {
	readonly type = ParkingActionTypes.ParkingUpdated;
	constructor(public payload: {
		partialParking: Update<ParkingModel>,
		parking: ParkingModel
	}) { }
}

export class ParkingDeleted implements Action {
	readonly type = ParkingActionTypes.ParkingDeleted;

	constructor(public payload: { id: string }) {}
}

export class ParkingPageRequested implements Action {
	readonly type = ParkingActionTypes.ParkingPageRequested;
	constructor(public payload: { page: QueryParkingModel }) { }
}

export class ParkingPageLoaded implements Action {
	readonly type = ParkingActionTypes.ParkingPageLoaded;
	constructor(public payload: { parking: ParkingModel[], totalCount: number, page: QueryParkingModel  }) { }
}


export class ParkingPageCancelled implements Action {
	readonly type = ParkingActionTypes.ParkingPageCancelled;
}

export class ParkingPageToggleLoading implements Action {
	readonly type = ParkingActionTypes.ParkingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ParkingActionToggleLoading implements Action {
	readonly type = ParkingActionTypes.ParkingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ParkingActions = ParkingCreated
	| ParkingUpdated
	| ParkingDeleted
	| ParkingOnServerCreated
	| ParkingPageLoaded
	| ParkingPageCancelled
	| ParkingPageToggleLoading
	| ParkingPageRequested
	| ParkingActionToggleLoading;
