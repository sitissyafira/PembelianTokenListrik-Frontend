import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { LocationBuildingModel } from './locationBuilding.model';
import { QueryLocationBuildingModel } from './querylocationBuilding.model';

export enum LocationBuildingActionTypes {
	AllUsersRequested = '[Block Module] All LocationBuilding Requested',
	AllUsersLoaded = '[Block API] All LocationBuilding Loaded',
	LocationBuildingOnServerCreated = '[Edit LocationBuilding Component] LocationBuilding On Server Created',
	LocationBuildingCreated = '[Edit LocationBuilding Dialog] LocationBuilding Created',
	LocationBuildingUpdated = '[Edit LocationBuilding Dialog] LocationBuilding Updated',
	LocationBuildingDeleted = '[LocationBuilding List Page] LocationBuilding Deleted',
	LocationBuildingPageRequested = '[LocationBuilding List Page] LocationBuilding Page Requested',
	LocationBuildingPageLoaded = '[LocationBuilding API] LocationBuilding Page Loaded',
	LocationBuildingPageCancelled = '[LocationBuilding API] LocationBuilding Page Cancelled',
	LocationBuildingPageToggleLoading = '[LocationBuilding] LocationBuilding Page Toggle Loading',
	LocationBuildingActionToggleLoading = '[LocationBuilding] LocationBuilding Action Toggle Loading'
}
export class LocationBuildingOnServerCreated implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingOnServerCreated;
	constructor(public payload: { locationBuilding: LocationBuildingModel }) { }
}
export class LocationBuildingCreated implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingCreated;
	constructor(public payload: { locationBuilding: LocationBuildingModel }) { }
}
export class LocationBuildingUpdated implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingUpdated;
	constructor(public payload: {
		partialLocationBuilding: Update<LocationBuildingModel>,
		locationBuilding: LocationBuildingModel
	}) { }
}
export class LocationBuildingDeleted implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingDeleted;

	constructor(public payload: { id: string }) {}
}
export class LocationBuildingPageRequested implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingPageRequested;
	constructor(public payload: { page: QueryLocationBuildingModel }) { }
}
export class LocationBuildingPageLoaded implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingPageLoaded;
	constructor(public payload: { locationBuilding: LocationBuildingModel[], totalCount: number, page: QueryLocationBuildingModel  }) { }
}
export class LocationBuildingPageCancelled implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingPageCancelled;
}
export class LocationBuildingPageToggleLoading implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class LocationBuildingActionToggleLoading implements Action {
	readonly type = LocationBuildingActionTypes.LocationBuildingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type LocationBuildingActions = LocationBuildingCreated
	| LocationBuildingUpdated
	| LocationBuildingDeleted
	| LocationBuildingOnServerCreated
	| LocationBuildingPageLoaded
	| LocationBuildingPageCancelled
	| LocationBuildingPageToggleLoading
	| LocationBuildingPageRequested
	| LocationBuildingActionToggleLoading;
