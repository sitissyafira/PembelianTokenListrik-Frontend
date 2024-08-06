import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComWaterModel } from './comWater.model';
import { QueryComWaterModel } from './querycomWater.model';

export enum ComWaterActionTypes {
	AllUsersRequested = '[Block Module] All ComWater Requested',
	AllUsersLoaded = '[Block API] All ComWater Loaded',
	ComWaterOnServerCreated = '[Edit ComWater Component] ComWater On Server Created',
	ComWaterCreated = '[Edit ComWater Dialog] ComWater Created',
	ComWaterUpdated = '[Edit ComWater Dialog] ComWater Updated',
	ComWaterDeleted = '[ComWater List Page] ComWater Deleted',
	ComWaterPageRequested = '[ComWater List Page] ComWater Page Requested',
	ComWaterPageLoaded = '[ComWater API] ComWater Page Loaded',
	ComWaterPageCancelled = '[ComWater API] ComWater Page Cancelled',
	ComWaterPageToggleLoading = '[ComWater] ComWater Page Toggle Loading',
	ComWaterActionToggleLoading = '[ComWater] ComWater Action Toggle Loading'
}
export class ComWaterOnServerCreated implements Action {
	readonly type = ComWaterActionTypes.ComWaterOnServerCreated;
	constructor(public payload: { comWater: ComWaterModel }) { }
}
export class ComWaterCreated implements Action {
	readonly type = ComWaterActionTypes.ComWaterCreated;
	constructor(public payload: { comWater: ComWaterModel }) { }
}
export class ComWaterUpdated implements Action {
	readonly type = ComWaterActionTypes.ComWaterUpdated;
	constructor(public payload: {
		partialComWater: Update<ComWaterModel>,
		comWater: ComWaterModel
	}) { }
}
export class ComWaterDeleted implements Action {
	readonly type = ComWaterActionTypes.ComWaterDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComWaterPageRequested implements Action {
	readonly type = ComWaterActionTypes.ComWaterPageRequested;
	constructor(public payload: { page: QueryComWaterModel }) { }
}
export class ComWaterPageLoaded implements Action {
	readonly type = ComWaterActionTypes.ComWaterPageLoaded;
	constructor(public payload: { comWater: ComWaterModel[], totalCount: number, page: QueryComWaterModel  }) { }
}
export class ComWaterPageCancelled implements Action {
	readonly type = ComWaterActionTypes.ComWaterPageCancelled;
}
export class ComWaterPageToggleLoading implements Action {
	readonly type = ComWaterActionTypes.ComWaterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComWaterActionToggleLoading implements Action {
	readonly type = ComWaterActionTypes.ComWaterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComWaterActions = ComWaterCreated
	| ComWaterUpdated
	| ComWaterDeleted
	| ComWaterOnServerCreated
	| ComWaterPageLoaded
	| ComWaterPageCancelled
	| ComWaterPageToggleLoading
	| ComWaterPageRequested
	| ComWaterActionToggleLoading;
