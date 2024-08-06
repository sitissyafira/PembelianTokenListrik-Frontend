// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { UnitTypeModel } from './unittype.model';
// Models
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

export enum UnitTypeActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	UnitTypeOnServerCreated = '[Edit UnitType Component] UnitType On Server Created',
	UnitTypeCreated = '[Edit UnitType Dialog] UnitType Created',
	UnitTypeUpdated = '[Edit UnitType Dialog] UnitType Updated',
	UnitTypeDeleted = '[UnitType List Page] UnitType Deleted',
	UnitTypePageRequested = '[UnitType List Page] UnitType Page Requested',
	UnitTypePageLoaded = '[UnitType API] UnitType Page Loaded',
	UnitTypePageCancelled = '[UnitType API] UnitType Page Cancelled',
	UnitTypePageToggleLoading = '[UnitType] UnitType Page Toggle Loading',
	UnitTypeActionToggleLoading = '[UnitType] UnitType Action Toggle Loading'
}
export class UnitTypeOnServerCreated implements Action {
	readonly type = UnitTypeActionTypes.UnitTypeOnServerCreated;
	constructor(public payload: { unittype: UnitTypeModel }) { }
}

export class UnitTypeCreated implements Action {
	readonly type = UnitTypeActionTypes.UnitTypeCreated;
	constructor(public payload: { unittype: UnitTypeModel }) { }
}


export class UnitTypeUpdated implements Action {
	readonly type = UnitTypeActionTypes.UnitTypeUpdated;
	constructor(public payload: {
		partialUnitType: Update<UnitTypeModel>,
		unittype: UnitTypeModel
	}) { }
}

export class UnitTypeDeleted implements Action {
	readonly type = UnitTypeActionTypes.UnitTypeDeleted;

	constructor(public payload: { id: string }) {}
}

export class UnitTypePageRequested implements Action {
	readonly type = UnitTypeActionTypes.UnitTypePageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class UnitTypePageLoaded implements Action {
	readonly type = UnitTypeActionTypes.UnitTypePageLoaded;
	constructor(public payload: { unittype: UnitTypeModel[], totalCount: number, page: QueryParamsModel  }) { }
}


export class UnitTypePageCancelled implements Action {
	readonly type = UnitTypeActionTypes.UnitTypePageCancelled;
}

export class UnitTypePageToggleLoading implements Action {
	readonly type = UnitTypeActionTypes.UnitTypePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class UnitTypeActionToggleLoading implements Action {
	readonly type = UnitTypeActionTypes.UnitTypeActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type UnitTypeActions = UnitTypeCreated
	| UnitTypeUpdated
	| UnitTypeDeleted
	| UnitTypeOnServerCreated
	| UnitTypePageLoaded
	| UnitTypePageCancelled
	| UnitTypePageToggleLoading
	| UnitTypePageRequested
	| UnitTypeActionToggleLoading;
