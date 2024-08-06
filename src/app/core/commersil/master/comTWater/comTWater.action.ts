import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComTWaterModel } from './comTWater.model';
import { QueryComTWaterModel } from './querycomTWater.model';

export enum ComTWaterActionTypes {
	AllUsersRequested = '[ComTWater Module] All ComTWater Requested',
	AllUsersLoaded = '[ComTWater API] All ComTWater Loaded',
	ComTWaterOnServerCreated = '[Edit ComTWater Component] ComTWater On Server Created',
	ComTWaterCreated = '[Edit ComTWater Dialog] ComTWater Created',
	ComTWaterUpdated = '[Edit ComTWater Dialog] ComTWater Updated',
	ComTWaterDeleted = '[ComTWater List Page] ComTWater Deleted',
	ComTWaterPageRequested = '[ComTWater List Page] ComTWater Page Requested',
	ComTWaterPageLoaded = '[ComTWater API] ComTWater Page Loaded',
	ComTWaterPageCancelled = '[ComTWater API] ComTWater Page Cancelled',
	ComTWaterPageToggleLoading = '[ComTWater] ComTWater Page Toggle Loading',
	ComTWaterActionToggleLoading = '[ComTWater] ComTWater Action Toggle Loading'
}
export class ComTWaterOnServerCreated implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterOnServerCreated;
	constructor(public payload: { comTWater: ComTWaterModel }) { }
}
export class ComTWaterCreated implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterCreated;
	constructor(public payload: { comTWater: ComTWaterModel }) { }
}
export class ComTWaterUpdated implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterUpdated;
	constructor(public payload: {
		partialComTWater: Update<ComTWaterModel>,
		comTWater: ComTWaterModel
	}) { }
}
export class ComTWaterDeleted implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComTWaterPageRequested implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterPageRequested;
	constructor(public payload: { page: QueryComTWaterModel }) { }
}
export class ComTWaterPageLoaded implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterPageLoaded;
	constructor(public payload: { comTWater: ComTWaterModel[], totalCount: number, page: QueryComTWaterModel  }) { }
}
export class ComTWaterPageCancelled implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterPageCancelled;
}
export class ComTWaterPageToggleLoading implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComTWaterActionToggleLoading implements Action {
	readonly type = ComTWaterActionTypes.ComTWaterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComTWaterActions = ComTWaterCreated
	| ComTWaterUpdated
	| ComTWaterDeleted
	| ComTWaterOnServerCreated
	| ComTWaterPageLoaded
	| ComTWaterPageCancelled
	| ComTWaterPageToggleLoading
	| ComTWaterPageRequested
	| ComTWaterActionToggleLoading;
