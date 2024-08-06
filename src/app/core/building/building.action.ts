// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { BuildingModel } from './building.model';
// Models
import {QueryBuildingModel} from './querybuilding.model';

export enum BuildingActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	BuildingOnServerCreated = '[Edit Building Component] Building On Server Created',
	BuildingCreated = '[Edit Building Dialog] Building Created',
	BuildingUpdated = '[Edit Building Dialog] Building Updated',
	BuildingDeleted = '[Building List Page] Building Deleted',
	BuildingPageRequested = '[Building List Page] Building Page Requested',
	BuildingPageLoaded = '[Building API] Building Page Loaded',
	BuildingPageCancelled = '[Building API] Building Page Cancelled',
	BuildingPageToggleLoading = '[Building] Building Page Toggle Loading',
	BuildingActionToggleLoading = '[Building] Building Action Toggle Loading'
}
export class BuildingOnServerCreated implements Action {
	readonly type = BuildingActionTypes.BuildingOnServerCreated;
	constructor(public payload: { building: BuildingModel }) { }
}

export class BuildingCreated implements Action {
	readonly type = BuildingActionTypes.BuildingCreated;
	constructor(public payload: { building: BuildingModel }) { }
}


export class BuildingUpdated implements Action {
	readonly type = BuildingActionTypes.BuildingUpdated;
	constructor(public payload: {
		partialBuilding: Update<BuildingModel>,
		building: BuildingModel
	}) { }
}

export class BuildingDeleted implements Action {
	readonly type = BuildingActionTypes.BuildingDeleted;

	constructor(public payload: { id: string }) {}
}

export class BuildingPageRequested implements Action {
	readonly type = BuildingActionTypes.BuildingPageRequested;
	constructor(public payload: { page: QueryBuildingModel }) { }
}

export class BuildingPageLoaded implements Action {
	readonly type = BuildingActionTypes.BuildingPageLoaded;
	constructor(public payload: { building: BuildingModel[], totalCount: number, page: QueryBuildingModel  }) { }
}


export class BuildingPageCancelled implements Action {
	readonly type = BuildingActionTypes.BuildingPageCancelled;
}

export class BuildingPageToggleLoading implements Action {
	readonly type = BuildingActionTypes.BuildingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BuildingActionToggleLoading implements Action {
	readonly type = BuildingActionTypes.BuildingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BuildingActions = BuildingCreated
	| BuildingUpdated
	| BuildingDeleted
	| BuildingOnServerCreated
	| BuildingPageLoaded
	| BuildingPageCancelled
	| BuildingPageToggleLoading
	| BuildingPageRequested
	| BuildingActionToggleLoading;
