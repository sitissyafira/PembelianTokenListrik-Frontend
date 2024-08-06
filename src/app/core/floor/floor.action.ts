// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { FloorModel } from './floor.model';
// Models
import {QueryFloorModel} from './queryfloor.model';

export enum FloorActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	FloorOnServerCreated = '[Edit Floor Component] Floor On Server Created',
	FloorCreated = '[Edit Floor Dialog] Floor Created',
	FloorUpdated = '[Edit Floor Dialog] Floor Updated',
	FloorDeleted = '[Floor List Page] Floor Deleted',
	FloorPageRequested = '[Floor List Page] Floor Page Requested',
	FloorPageLoaded = '[Floor API] Floor Page Loaded',
	FloorPageCancelled = '[Floor API] Floor Page Cancelled',
	FloorPageToggleLoading = '[Floor] Floor Page Toggle Loading',
	FloorActionToggleLoading = '[Floor] Floor Action Toggle Loading'
}
export class FloorOnServerCreated implements Action {
	readonly type = FloorActionTypes.FloorOnServerCreated;
	constructor(public payload: { floor: FloorModel }) { }
}

export class FloorCreated implements Action {
	readonly type = FloorActionTypes.FloorCreated;
	constructor(public payload: { floor: FloorModel }) { }
}


export class FloorUpdated implements Action {
	readonly type = FloorActionTypes.FloorUpdated;
	constructor(public payload: {
		partialFloor: Update<FloorModel>,
		floor: FloorModel
	}) { }
}

export class FloorDeleted implements Action {
	readonly type = FloorActionTypes.FloorDeleted;

	constructor(public payload: { id: string }) {}
}

export class FloorPageRequested implements Action {
	readonly type = FloorActionTypes.FloorPageRequested;
	constructor(public payload: { page: QueryFloorModel }) { }
}

export class FloorPageLoaded implements Action {
	readonly type = FloorActionTypes.FloorPageLoaded;
	constructor(public payload: { floor: FloorModel[], totalCount: number, page: QueryFloorModel  }) { }
}


export class FloorPageCancelled implements Action {
	readonly type = FloorActionTypes.FloorPageCancelled;
}

export class FloorPageToggleLoading implements Action {
	readonly type = FloorActionTypes.FloorPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class FloorActionToggleLoading implements Action {
	readonly type = FloorActionTypes.FloorActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type FloorActions = FloorCreated
	| FloorUpdated
	| FloorDeleted
	| FloorOnServerCreated
	| FloorPageLoaded
	| FloorPageCancelled
	| FloorPageToggleLoading
	| FloorPageRequested
	| FloorActionToggleLoading;
