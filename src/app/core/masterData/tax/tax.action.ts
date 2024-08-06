import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { TaxModel } from './tax.model';
import { QueryTaxModel } from './querytax.model';

export enum TaxActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TaxOnServerCreated = '[Edit Tax Component] Tax On Server Created',
	TaxCreated = '[Edit Tax Dialog] Tax Created',
	TaxUpdated = '[Edit Tax Dialog] Tax Updated',
	TaxDeleted = '[Tax List Page] Tax Deleted',
	TaxPageRequested = '[Tax List Page] Tax Page Requested',
	TaxPageLoaded = '[Tax API] Tax Page Loaded',
	TaxPageCancelled = '[Tax API] Tax Page Cancelled',
	TaxPageToggleLoading = '[Tax] Tax Page Toggle Loading',
	TaxActionToggleLoading = '[Tax] Tax Action Toggle Loading'
}
export class TaxOnServerCreated implements Action {
	readonly type = TaxActionTypes.TaxOnServerCreated;
	constructor(public payload: { tax: TaxModel }) { }
}
export class TaxCreated implements Action {
	readonly type = TaxActionTypes.TaxCreated;
	constructor(public payload: { tax: TaxModel }) { }
}
export class TaxUpdated implements Action {
	readonly type = TaxActionTypes.TaxUpdated;
	constructor(public payload: {
		partialTax: Update<TaxModel>,
		tax: TaxModel
	}) { }
}
export class TaxDeleted implements Action {
	readonly type = TaxActionTypes.TaxDeleted;

	constructor(public payload: { id: string }) {}
}
export class TaxPageRequested implements Action {
	readonly type = TaxActionTypes.TaxPageRequested;
	constructor(public payload: { page: QueryTaxModel }) { }
}
export class TaxPageLoaded implements Action {
	readonly type = TaxActionTypes.TaxPageLoaded;
	constructor(public payload: { tax: TaxModel[], totalCount: number, page: QueryTaxModel  }) { }
}
export class TaxPageCancelled implements Action {
	readonly type = TaxActionTypes.TaxPageCancelled;
}
export class TaxPageToggleLoading implements Action {
	readonly type = TaxActionTypes.TaxPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class TaxActionToggleLoading implements Action {
	readonly type = TaxActionTypes.TaxActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type TaxActions = TaxCreated
	| TaxUpdated
	| TaxDeleted
	| TaxOnServerCreated
	| TaxPageLoaded
	| TaxPageCancelled
	| TaxPageToggleLoading
	| TaxPageRequested
	| TaxActionToggleLoading;
