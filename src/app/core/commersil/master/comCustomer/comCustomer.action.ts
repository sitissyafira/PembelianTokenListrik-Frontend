import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ComCustomerModel } from './comCustomer.model';
import { QueryComCustomerModel } from './querycomCustomer.model';

export enum ComCustomerActionTypes {
	AllUsersRequested = '[Block Module] All ComCustomer Requested',
	AllUsersLoaded = '[Block API] All ComCustomer Loaded',
	ComCustomerOnServerCreated = '[Edit ComCustomer Component] ComCustomer On Server Created',
	ComCustomerCreated = '[Edit ComCustomer Dialog] ComCustomer Created',
	ComCustomerUpdated = '[Edit ComCustomer Dialog] ComCustomer Updated',
	ComCustomerDeleted = '[ComCustomer List Page] ComCustomer Deleted',
	ComCustomerPageRequested = '[ComCustomer List Page] ComCustomer Page Requested',
	ComCustomerPageLoaded = '[ComCustomer API] ComCustomer Page Loaded',
	ComCustomerPageCancelled = '[ComCustomer API] ComCustomer Page Cancelled',
	ComCustomerPageToggleLoading = '[ComCustomer] ComCustomer Page Toggle Loading',
	ComCustomerActionToggleLoading = '[ComCustomer] ComCustomer Action Toggle Loading'
}
export class ComCustomerOnServerCreated implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerOnServerCreated;
	constructor(public payload: { comCustomer: ComCustomerModel }) { }
}
export class ComCustomerCreated implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerCreated;
	constructor(public payload: { comCustomer: ComCustomerModel }) { }
}
export class ComCustomerUpdated implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerUpdated;
	constructor(public payload: {
		partialComCustomer: Update<ComCustomerModel>,
		comCustomer: ComCustomerModel
	}) { }
}
export class ComCustomerDeleted implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerDeleted;

	constructor(public payload: { id: string }) {}
}
export class ComCustomerPageRequested implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerPageRequested;
	constructor(public payload: { page: QueryComCustomerModel }) { }
}
export class ComCustomerPageLoaded implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerPageLoaded;
	constructor(public payload: { comCustomer: ComCustomerModel[], totalCount: number, page: QueryComCustomerModel  }) { }
}
export class ComCustomerPageCancelled implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerPageCancelled;
}
export class ComCustomerPageToggleLoading implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ComCustomerActionToggleLoading implements Action {
	readonly type = ComCustomerActionTypes.ComCustomerActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ComCustomerActions = ComCustomerCreated
	| ComCustomerUpdated
	| ComCustomerDeleted
	| ComCustomerOnServerCreated
	| ComCustomerPageLoaded
	| ComCustomerPageCancelled
	| ComCustomerPageToggleLoading
	| ComCustomerPageRequested
	| ComCustomerActionToggleLoading;
