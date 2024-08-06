import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CurrencyModel } from './currency.model';
import { QueryCurrencyModel } from './querycurrency.model';

export enum CurrencyActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	CurrencyOnServerCreated = '[Edit Currency Component] Currency On Server Created',
	CurrencyCreated = '[Edit Currency Dialog] Currency Created',
	CurrencyUpdated = '[Edit Currency Dialog] Currency Updated',
	CurrencyDeleted = '[Currency List Page] Currency Deleted',
	CurrencyPageRequested = '[Currency List Page] Currency Page Requested',
	CurrencyPageLoaded = '[Currency API] Currency Page Loaded',
	CurrencyPageCancelled = '[Currency API] Currency Page Cancelled',
	CurrencyPageToggleLoading = '[Currency] Currency Page Toggle Loading',
	CurrencyActionToggleLoading = '[Currency] Currency Action Toggle Loading'
}
export class CurrencyOnServerCreated implements Action {
	readonly type = CurrencyActionTypes.CurrencyOnServerCreated;
	constructor(public payload: { currency: CurrencyModel }) { }
}
export class CurrencyCreated implements Action {
	readonly type = CurrencyActionTypes.CurrencyCreated;
	constructor(public payload: { currency: CurrencyModel }) { }
}
export class CurrencyUpdated implements Action {
	readonly type = CurrencyActionTypes.CurrencyUpdated;
	constructor(public payload: {
		partialCurrency: Update<CurrencyModel>,
		currency: CurrencyModel
	}) { }
}
export class CurrencyDeleted implements Action {
	readonly type = CurrencyActionTypes.CurrencyDeleted;

	constructor(public payload: { id: string }) {}
}
export class CurrencyPageRequested implements Action {
	readonly type = CurrencyActionTypes.CurrencyPageRequested;
	constructor(public payload: { page: QueryCurrencyModel }) { }
}
export class CurrencyPageLoaded implements Action {
	readonly type = CurrencyActionTypes.CurrencyPageLoaded;
	constructor(public payload: { currency: CurrencyModel[], totalCount: number, page: QueryCurrencyModel  }) { }
}
export class CurrencyPageCancelled implements Action {
	readonly type = CurrencyActionTypes.CurrencyPageCancelled;
}
export class CurrencyPageToggleLoading implements Action {
	readonly type = CurrencyActionTypes.CurrencyPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class CurrencyActionToggleLoading implements Action {
	readonly type = CurrencyActionTypes.CurrencyActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type CurrencyActions = CurrencyCreated
	| CurrencyUpdated
	| CurrencyDeleted
	| CurrencyOnServerCreated
	| CurrencyPageLoaded
	| CurrencyPageCancelled
	| CurrencyPageToggleLoading
	| CurrencyPageRequested
	| CurrencyActionToggleLoading;
