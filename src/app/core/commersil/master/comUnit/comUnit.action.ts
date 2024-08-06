import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComUnitModel } from './comUnit.model';
import { QueryComUnitModel } from './querycomUnit.model';

export enum ComUnitActionTypes {
	AllUsersRequested = '[Block Module] All ComUnit Requested',
	AllUsersLoaded = '[Block API] All ComUnit Loaded',
	ComUnitOnServerCreated = '[Edit ComUnit Component] ComUnit On Server Created',
	ComUnitCreated = '[Edit ComUnit Dialog] ComUnit Created',
	ComUnitUpdated = '[Edit ComUnit Dialog] ComUnit Updated',
	ComUnitDeleted = '[ComUnit List Page] ComUnit Deleted',
	ComUnitPageRequested = '[ComUnit List Page] ComUnit Page Requested',
	ComUnitPageLoaded = '[ComUnit API] ComUnit Page Loaded',
	ComUnitPageCancelled = '[ComUnit API] ComUnit Page Cancelled',
	ComUnitPageToggleLoading = '[ComUnit] ComUnit Page Toggle Loading',
	ComUnitActionToggleLoading = '[ComUnit] ComUnit Action Toggle Loading'
}
export class ComUnitOnServerCreated implements Action {
	readonly type = ComUnitActionTypes.ComUnitOnServerCreated;
	constructor(public payload: { comUnit: ComUnitModel }) { }
}
export class ComUnitCreated implements Action {
	readonly type = ComUnitActionTypes.ComUnitCreated;
	constructor(public payload: { comUnit: ComUnitModel }) { }
}
export class ComUnitUpdated implements Action {
	readonly type = ComUnitActionTypes.ComUnitUpdated;
	constructor(public payload: {
		partialComUnit: Update<ComUnitModel>,
		comUnit: ComUnitModel
	}) { }
}
export class ComUnitDeleted implements Action {
	readonly type = ComUnitActionTypes.ComUnitDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComUnitPageRequested implements Action {
	readonly type = ComUnitActionTypes.ComUnitPageRequested;
	constructor(public payload: { page: QueryComUnitModel }) { }
}
export class ComUnitPageLoaded implements Action {
	readonly type = ComUnitActionTypes.ComUnitPageLoaded;
	constructor(public payload: { comUnit: ComUnitModel[], totalCount: number, page: QueryComUnitModel  }) { }
}
export class ComUnitPageCancelled implements Action {
	readonly type = ComUnitActionTypes.ComUnitPageCancelled;
}
export class ComUnitPageToggleLoading implements Action {
	readonly type = ComUnitActionTypes.ComUnitPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComUnitActionToggleLoading implements Action {
	readonly type = ComUnitActionTypes.ComUnitActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComUnitActions = ComUnitCreated
	| ComUnitUpdated
	| ComUnitDeleted
	| ComUnitOnServerCreated
	| ComUnitPageLoaded
	| ComUnitPageCancelled
	| ComUnitPageToggleLoading
	| ComUnitPageRequested
	| ComUnitActionToggleLoading;
