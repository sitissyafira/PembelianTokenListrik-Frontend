import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComTPowerModel } from './comTPower.model';
import { QueryComTPowerModel } from './querycomTPower.model';

export enum ComTPowerActionTypes {
	AllUsersRequested = '[Block Module] All ComTPower Requested',
	AllUsersLoaded = '[Block API] All ComTPower Loaded',
	ComTPowerOnServerCreated = '[Edit ComTPower Component] ComTPower On Server Created',
	ComTPowerCreated = '[Edit ComTPower Dialog] ComTPower Created',
	ComTPowerUpdated = '[Edit ComTPower Dialog] ComTPower Updated',
	ComTPowerDeleted = '[ComTPower List Page] ComTPower Deleted',
	ComTPowerPageRequested = '[ComTPower List Page] ComTPower Page Requested',
	ComTPowerPageLoaded = '[ComTPower API] ComTPower Page Loaded',
	ComTPowerPageCancelled = '[ComTPower API] ComTPower Page Cancelled',
	ComTPowerPageToggleLoading = '[ComTPower] ComTPower Page Toggle Loading',
	ComTPowerActionToggleLoading = '[ComTPower] ComTPower Action Toggle Loading'
}
export class ComTPowerOnServerCreated implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerOnServerCreated;
	constructor(public payload: { comTPower: ComTPowerModel }) { }
}
export class ComTPowerCreated implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerCreated;
	constructor(public payload: { comTPower: ComTPowerModel }) { }
}
export class ComTPowerUpdated implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerUpdated;
	constructor(public payload: {
		partialComTPower: Update<ComTPowerModel>,
		comTPower: ComTPowerModel
	}) { }
}
export class ComTPowerDeleted implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComTPowerPageRequested implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerPageRequested;
	constructor(public payload: { page: QueryComTPowerModel }) { }
}
export class ComTPowerPageLoaded implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerPageLoaded;
	constructor(public payload: { comTPower: ComTPowerModel[], totalCount: number, page: QueryComTPowerModel  }) { }
}
export class ComTPowerPageCancelled implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerPageCancelled;
}
export class ComTPowerPageToggleLoading implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComTPowerActionToggleLoading implements Action {
	readonly type = ComTPowerActionTypes.ComTPowerActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComTPowerActions = ComTPowerCreated
	| ComTPowerUpdated
	| ComTPowerDeleted
	| ComTPowerOnServerCreated
	| ComTPowerPageLoaded
	| ComTPowerPageCancelled
	| ComTPowerPageToggleLoading
	| ComTPowerPageRequested
	| ComTPowerActionToggleLoading;
