// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { UnitModel } from './unit.model';
// Models
import {QueryUnitModel} from './queryunit.model';

export enum UnitActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	UnitOnServerCreated = '[Edit Unit Component] Unit On Server Created',
	UnitCreated = '[Edit Unit Dialog] Unit Created',
	UnitUpdated = '[Edit Unit Dialog] Unit Updated',
	UnitDeleted = '[Unit List Page] Unit Deleted',
	UnitPageRequested = '[Unit List Page] Unit Page Requested',
	UnitPageLoaded = '[Unit API] Unit Page Loaded',
	UnitPageCancelled = '[Unit API] Unit Page Cancelled',
	UnitPageToggleLoading = '[Unit] Unit Page Toggle Loading',
	UnitActionToggleLoading = '[Unit] Unit Action Toggle Loading'
}
export class UnitOnServerCreated implements Action {
	readonly type = UnitActionTypes.UnitOnServerCreated;
	constructor(public payload: { unit: UnitModel }) { }
}

export class UnitCreated implements Action {
	readonly type = UnitActionTypes.UnitCreated;
	constructor(public payload: { unit: UnitModel }) { }
}


export class UnitUpdated implements Action {
	readonly type = UnitActionTypes.UnitUpdated;
	constructor(public payload: {
		partialUnit: Update<UnitModel>,
		unit: UnitModel
	}) { }
}

export class UnitDeleted implements Action {
	readonly type = UnitActionTypes.UnitDeleted;

	constructor(public payload: { id: string }) {}
}

export class UnitPageRequested implements Action {
	readonly type = UnitActionTypes.UnitPageRequested;
	constructor(public payload: { page: QueryUnitModel }) { }
}

export class UnitPageLoaded implements Action {
	readonly type = UnitActionTypes.UnitPageLoaded;
	constructor(public payload: { unit: UnitModel[], totalCount: number, page: QueryUnitModel  }) { }
}


export class UnitPageCancelled implements Action {
	readonly type = UnitActionTypes.UnitPageCancelled;
}

export class UnitPageToggleLoading implements Action {
	readonly type = UnitActionTypes.UnitPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class UnitActionToggleLoading implements Action {
	readonly type = UnitActionTypes.UnitActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type UnitActions = UnitCreated
	| UnitUpdated
	| UnitDeleted
	| UnitOnServerCreated
	| UnitPageLoaded
	| UnitPageCancelled
	| UnitPageToggleLoading
	| UnitPageRequested
	| UnitActionToggleLoading;
