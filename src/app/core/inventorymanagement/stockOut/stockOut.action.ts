import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { StockOutModel } from './stockOut.model';
import { QueryStockOutModel } from './querystockOut.model';

export enum StockOutActionTypes {
	AllUsersRequested = '[Block Module] All StockOut Requested',
	AllUsersLoaded = '[Block API] All StockOut Loaded',
	StockOutOnServerCreated = '[Edit StockOut Component] StockOut On Server Created',
	StockOutCreated = '[Edit StockOut Dialog] StockOut Created',
	StockOutUpdated = '[Edit StockOut Dialog] StockOut Updated',
	StockOutDeleted = '[StockOut List Page] StockOut Deleted',
	StockOutPageRequested = '[StockOut List Page] StockOut Page Requested',
	StockOutPageLoaded = '[StockOut API] StockOut Page Loaded',
	StockOutPageCancelled = '[StockOut API] StockOut Page Cancelled',
	StockOutPageToggleLoading = '[StockOut] StockOut Page Toggle Loading',
	StockOutActionToggleLoading = '[StockOut] StockOut Action Toggle Loading'
}
export class StockOutOnServerCreated implements Action {
	readonly type = StockOutActionTypes.StockOutOnServerCreated;
	constructor(public payload: { stockOut: StockOutModel }) { }
}
export class StockOutCreated implements Action {
	readonly type = StockOutActionTypes.StockOutCreated;
	constructor(public payload: { stockOut: StockOutModel }) { }
}
export class StockOutUpdated implements Action {
	readonly type = StockOutActionTypes.StockOutUpdated;
	constructor(public payload: {
		partialStockOut: Update<StockOutModel>,
		stockOut: StockOutModel
	}) { }
}
export class StockOutDeleted implements Action {
	readonly type = StockOutActionTypes.StockOutDeleted;

	constructor(public payload: { id: string }) {}
}
export class StockOutPageRequested implements Action {
	readonly type = StockOutActionTypes.StockOutPageRequested;
	constructor(public payload: { page: QueryStockOutModel }) { }
}
export class StockOutPageLoaded implements Action {
	readonly type = StockOutActionTypes.StockOutPageLoaded;
	constructor(public payload: { stockOut: StockOutModel[], totalCount: number, page: QueryStockOutModel  }) { }
}
export class StockOutPageCancelled implements Action {
	readonly type = StockOutActionTypes.StockOutPageCancelled;
}
export class StockOutPageToggleLoading implements Action {
	readonly type = StockOutActionTypes.StockOutPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class StockOutActionToggleLoading implements Action {
	readonly type = StockOutActionTypes.StockOutActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type StockOutActions = StockOutCreated
	| StockOutUpdated
	| StockOutDeleted
	| StockOutOnServerCreated
	| StockOutPageLoaded
	| StockOutPageCancelled
	| StockOutPageToggleLoading
	| StockOutPageRequested
	| StockOutActionToggleLoading;
