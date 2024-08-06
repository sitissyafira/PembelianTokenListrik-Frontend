import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComTypeModel } from './comType.model';
import { QueryComTypeModel } from './querycomType.model';

export enum ComTypeActionTypes {
	AllUsersRequested = '[Block Module] All ComType Requested',
	AllUsersLoaded = '[Block API] All ComType Loaded',
	ComTypeOnServerCreated = '[Edit ComType Component] ComType On Server Created',
	ComTypeCreated = '[Edit ComType Dialog] ComType Created',
	ComTypeUpdated = '[Edit ComType Dialog] ComType Updated',
	ComTypeDeleted = '[ComType List Page] ComType Deleted',
	ComTypePageRequested = '[ComType List Page] ComType Page Requested',
	ComTypePageLoaded = '[ComType API] ComType Page Loaded',
	ComTypePageCancelled = '[ComType API] ComType Page Cancelled',
	ComTypePageToggleLoading = '[ComType] ComType Page Toggle Loading',
	ComTypeActionToggleLoading = '[ComType] ComType Action Toggle Loading'
}
export class ComTypeOnServerCreated implements Action {
	readonly type = ComTypeActionTypes.ComTypeOnServerCreated;
	constructor(public payload: { comType: ComTypeModel }) { }
}
export class ComTypeCreated implements Action {
	readonly type = ComTypeActionTypes.ComTypeCreated;
	constructor(public payload: { comType: ComTypeModel }) { }
}
export class ComTypeUpdated implements Action {
	readonly type = ComTypeActionTypes.ComTypeUpdated;
	constructor(public payload: {
		partialComType: Update<ComTypeModel>,
		comType: ComTypeModel
	}) { }
}
export class ComTypeDeleted implements Action {
	readonly type = ComTypeActionTypes.ComTypeDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComTypePageRequested implements Action {
	readonly type = ComTypeActionTypes.ComTypePageRequested;
	constructor(public payload: { page: QueryComTypeModel }) { }
}
export class ComTypePageLoaded implements Action {
	readonly type = ComTypeActionTypes.ComTypePageLoaded;
	constructor(public payload: { comType: ComTypeModel[], totalCount: number, page: QueryComTypeModel  }) { }
}
export class ComTypePageCancelled implements Action {
	readonly type = ComTypeActionTypes.ComTypePageCancelled;
}
export class ComTypePageToggleLoading implements Action {
	readonly type = ComTypeActionTypes.ComTypePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComTypeActionToggleLoading implements Action {
	readonly type = ComTypeActionTypes.ComTypeActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComTypeActions = ComTypeCreated
	| ComTypeUpdated
	| ComTypeDeleted
	| ComTypeOnServerCreated
	| ComTypePageLoaded
	| ComTypePageCancelled
	| ComTypePageToggleLoading
	| ComTypePageRequested
	| ComTypeActionToggleLoading;
