import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { RequestInvoiceModel } from './requestInvoice.model';
import { QueryRequestInvoiceModel } from './queryrequestInvoice.model';

export enum RequestInvoiceActionTypes {
	AllUsersRequested = '[Block Module] All RequestInvoice Requested',
	AllUsersLoaded = '[Block API] All RequestInvoice Loaded',
	RequestInvoiceOnServerCreated = '[Edit RequestInvoice Component] RequestInvoice On Server Created',
	RequestInvoiceCreated = '[Edit RequestInvoice Dialog] RequestInvoice Created',
	RequestInvoiceUpdated = '[Edit RequestInvoice Dialog] RequestInvoice Updated',
	RequestInvoiceDeleted = '[RequestInvoice List Page] RequestInvoice Deleted',
	RequestInvoicePageRequested = '[RequestInvoice List Page] RequestInvoice Page Requested',
	RequestInvoicePageLoaded = '[RequestInvoice API] RequestInvoice Page Loaded',
	RequestInvoicePageCancelled = '[RequestInvoice API] RequestInvoice Page Cancelled',
	RequestInvoicePageToggleLoading = '[RequestInvoice] RequestInvoice Page Toggle Loading',
	RequestInvoiceActionToggleLoading = '[RequestInvoice] RequestInvoice Action Toggle Loading'
}
export class RequestInvoiceOnServerCreated implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoiceOnServerCreated;
	constructor(public payload: { requestInvoice: RequestInvoiceModel }) { }
}
export class RequestInvoiceCreated implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoiceCreated;
	constructor(public payload: { requestInvoice: RequestInvoiceModel }) { }
}
export class RequestInvoiceUpdated implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoiceUpdated;
	constructor(public payload: {
		partialRequestInvoice: Update<RequestInvoiceModel>,
		requestInvoice: RequestInvoiceModel
	}) { }
}
export class RequestInvoiceDeleted implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoiceDeleted;

	constructor(public payload: { id: string }) {}
}
export class RequestInvoicePageRequested implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoicePageRequested;
	constructor(public payload: { page: QueryRequestInvoiceModel }) { }
}
export class RequestInvoicePageLoaded implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoicePageLoaded;
	constructor(public payload: { requestInvoice: RequestInvoiceModel[], totalCount: number, page: QueryRequestInvoiceModel  }) { }
}
export class RequestInvoicePageCancelled implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoicePageCancelled;
}
export class RequestInvoicePageToggleLoading implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoicePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class RequestInvoiceActionToggleLoading implements Action {
	readonly type = RequestInvoiceActionTypes.RequestInvoiceActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type RequestInvoiceActions = RequestInvoiceCreated
	| RequestInvoiceUpdated
	| RequestInvoiceDeleted
	| RequestInvoiceOnServerCreated
	| RequestInvoicePageLoaded
	| RequestInvoicePageCancelled
	| RequestInvoicePageToggleLoading
	| RequestInvoicePageRequested
	| RequestInvoiceActionToggleLoading;
