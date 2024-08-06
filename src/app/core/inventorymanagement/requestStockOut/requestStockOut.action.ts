import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { RequestStockOutModel } from './requestStockOut.model';
import { QueryRequestStockOutModel } from './queryrequestStockOut.model';

export enum RequestStockOutActionTypes {
	AllUsersRequested = '[Block Module] All RequestStockOut Requested',
	AllUsersLoaded = '[Block API] All RequestStockOut Loaded',
	RequestStockOutOnServerCreated = '[Edit RequestStockOut Component] RequestStockOut On Server Created',
	RequestStockOutCreated = '[Edit RequestStockOut Dialog] RequestStockOut Created',
	RequestStockOutUpdated = '[Edit RequestStockOut Dialog] RequestStockOut Updated',
	RequestStockOutDeleted = '[RequestStockOut List Page] RequestStockOut Deleted',
	RequestStockOutPageRequested = '[RequestStockOut List Page] RequestStockOut Page Requested',
	RequestStockOutPageLoaded = '[RequestStockOut API] RequestStockOut Page Loaded',
	RequestStockOutPageCancelled = '[RequestStockOut API] RequestStockOut Page Cancelled',
	RequestStockOutPageToggleLoading = '[RequestStockOut] RequestStockOut Page Toggle Loading',
	RequestStockOutActionToggleLoading = '[RequestStockOut] RequestStockOut Action Toggle Loading'
}
export class RequestStockOutOnServerCreated implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutOnServerCreated;
	constructor(public payload: { requestStockOut: RequestStockOutModel }) { }
}
export class RequestStockOutCreated implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutCreated;
	constructor(public payload: { requestStockOut: RequestStockOutModel }) { }
}
export class RequestStockOutUpdated implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutUpdated;
	constructor(public payload: {
		partialRequestStockOut: Update<RequestStockOutModel>,
		requestStockOut: RequestStockOutModel
	}) { }
}
export class RequestStockOutDeleted implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutDeleted;

	constructor(public payload: { id: string }) {}
}
export class RequestStockOutPageRequested implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutPageRequested;
	constructor(public payload: { page: QueryRequestStockOutModel }) { }
}
export class RequestStockOutPageLoaded implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutPageLoaded;
	constructor(public payload: { requestStockOut: RequestStockOutModel[], totalCount: number, page: QueryRequestStockOutModel  }) { }
}
export class RequestStockOutPageCancelled implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutPageCancelled;
}
export class RequestStockOutPageToggleLoading implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class RequestStockOutActionToggleLoading implements Action {
	readonly type = RequestStockOutActionTypes.RequestStockOutActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type RequestStockOutActions = RequestStockOutCreated
	| RequestStockOutUpdated
	| RequestStockOutDeleted
	| RequestStockOutOnServerCreated
	| RequestStockOutPageLoaded
	| RequestStockOutPageCancelled
	| RequestStockOutPageToggleLoading
	| RequestStockOutPageRequested
	| RequestStockOutActionToggleLoading;
