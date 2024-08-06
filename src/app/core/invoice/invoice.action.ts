// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { InvoiceModel } from './invoice.model';
// Models
import {QueryInvoiceModel} from './queryinvoice.model';

export enum InvoiceActionTypes {
	AllUsersRequested = '[Invoice Module] All Invoice Requested',
	AllUsersLoaded = '[Invoice API] All Invoice Loaded',
	InvoiceOnServerCreated = '[Edit Invoice Component] Invoice On Server Created',
	InvoiceCreated = '[Edit Invoice Dialog] Invoice Created',
	InvoiceUpdated = '[Edit Invoice Dialog] Invoice Updated',
	InvoiceDeleted = '[Invoice List Page] Invoice Deleted',
	InvoicePageRequested = '[Invoice List Page] Invoice Page Requested',
	InvoicePageLoaded = '[Invoice API] Invoice Page Loaded',
	InvoicePageCancelled = '[Invoice API] Invoice Page Cancelled',
	InvoicePageToggleLoading = '[Invoice] Invoice Page Toggle Loading',
	InvoiceActionToggleLoading = '[Invoice] Invoice Action Toggle Loading'
}
export class InvoiceOnServerCreated implements Action {
	readonly type = InvoiceActionTypes.InvoiceOnServerCreated;
	constructor(public payload: { invoice: InvoiceModel }) { }
}

export class InvoiceCreated implements Action {
	readonly type = InvoiceActionTypes.InvoiceCreated;
	constructor(public payload: { invoice: InvoiceModel }) { }
}


export class InvoiceUpdated implements Action {
	readonly type = InvoiceActionTypes.InvoiceUpdated;
	constructor(public payload: {
		partialInvoice: Update<InvoiceModel>,
		invoice: InvoiceModel
	}) { }
}

export class InvoiceDeleted implements Action {
	readonly type = InvoiceActionTypes.InvoiceDeleted;

	constructor(public payload: { id: string }) {}
}

export class InvoicePageRequested implements Action {
	readonly type = InvoiceActionTypes.InvoicePageRequested;
	constructor(public payload: { page: QueryInvoiceModel }) { }
}

export class InvoicePageLoaded implements Action {
	readonly type = InvoiceActionTypes.InvoicePageLoaded;
	constructor(public payload: { invoice: InvoiceModel[], totalCount: number, page: QueryInvoiceModel  }) { }
}


export class InvoicePageCancelled implements Action {
	readonly type = InvoiceActionTypes.InvoicePageCancelled;
}

export class InvoicePageToggleLoading implements Action {
	readonly type = InvoiceActionTypes.InvoicePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class InvoiceActionToggleLoading implements Action {
	readonly type = InvoiceActionTypes.InvoiceActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type InvoiceActions = InvoiceCreated
	| InvoiceUpdated
	| InvoiceDeleted
	| InvoiceOnServerCreated
	| InvoicePageLoaded
	| InvoicePageCancelled
	| InvoicePageToggleLoading
	| InvoicePageRequested
	| InvoiceActionToggleLoading;
