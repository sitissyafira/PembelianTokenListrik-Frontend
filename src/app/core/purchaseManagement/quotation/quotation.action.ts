import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { QuotationModel } from './quotation.model';
import { QueryQuotationModel } from './queryquotation.model';

export enum QuotationActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	QuotationOnServerCreated = '[Edit Quotation Component] Quotation On Server Created',
	QuotationCreated = '[Edit Quotation Dialog] Quotation Created',
	QuotationUpdated = '[Edit Quotation Dialog] Quotation Updated',
	QuotationDeleted = '[Quotation List Page] Quotation Deleted',
	QuotationPageRequested = '[Quotation List Page] Quotation Page Requested',
	QuotationPageLoaded = '[Quotation API] Quotation Page Loaded',
	QuotationPageCancelled = '[Quotation API] Quotation Page Cancelled',
	QuotationPageToggleLoading = '[Quotation] Quotation Page Toggle Loading',
	QuotationActionToggleLoading = '[Quotation] Quotation Action Toggle Loading'
}
export class QuotationOnServerCreated implements Action {
	readonly type = QuotationActionTypes.QuotationOnServerCreated;
	constructor(public payload: { quotation: QuotationModel }) { }
}
export class QuotationCreated implements Action {
	readonly type = QuotationActionTypes.QuotationCreated;
	constructor(public payload: { quotation: QuotationModel }) { }
}
export class QuotationUpdated implements Action {
	readonly type = QuotationActionTypes.QuotationUpdated;
	constructor(public payload: {
		partialQuotation: Update<QuotationModel>,
		quotation: QuotationModel
	}) { }
}
export class QuotationDeleted implements Action {
	readonly type = QuotationActionTypes.QuotationDeleted;

	constructor(public payload: { id: string }) {}
}
export class QuotationPageRequested implements Action {
	readonly type = QuotationActionTypes.QuotationPageRequested;
	constructor(public payload: { page: QueryQuotationModel }) { }
}
export class QuotationPageLoaded implements Action {
	readonly type = QuotationActionTypes.QuotationPageLoaded;
	constructor(public payload: { quotation: QuotationModel[], totalCount: number, page: QueryQuotationModel  }) { }
}
export class QuotationPageCancelled implements Action {
	readonly type = QuotationActionTypes.QuotationPageCancelled;
}
export class QuotationPageToggleLoading implements Action {
	readonly type = QuotationActionTypes.QuotationPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class QuotationActionToggleLoading implements Action {
	readonly type = QuotationActionTypes.QuotationActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type QuotationActions = QuotationCreated
	| QuotationUpdated
	| QuotationDeleted
	| QuotationOnServerCreated
	| QuotationPageLoaded
	| QuotationPageCancelled
	| QuotationPageToggleLoading
	| QuotationPageRequested
	| QuotationActionToggleLoading;
