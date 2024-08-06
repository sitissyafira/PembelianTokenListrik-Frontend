import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { StockInModel } from './stockIn.model';
import { QueryStockInModel } from './querystockIn.model';

export enum StockInActionTypes {
	AllUsersRequested = '[Block Module] All StockIn Requested',
	AllUsersLoaded = '[Block API] All StockIn Loaded',
	StockInOnServerCreated = '[Edit StockIn Component] StockIn On Server Created',
	StockInCreated = '[Edit StockIn Dialog] StockIn Created',
	StockInUpdated = '[Edit StockIn Dialog] StockIn Updated',
	StockInDeleted = '[StockIn List Page] StockIn Deleted',
	StockInPageRequested = '[StockIn List Page] StockIn Page Requested',
	StockInPageLoaded = '[StockIn API] StockIn Page Loaded',
	StockInPageCancelled = '[StockIn API] StockIn Page Cancelled',
	StockInPageToggleLoading = '[StockIn] StockIn Page Toggle Loading',
	StockInActionToggleLoading = '[StockIn] StockIn Action Toggle Loading'
}
export class StockInOnServerCreated implements Action {
	readonly type = StockInActionTypes.StockInOnServerCreated;
	constructor(public payload: { stockIn: StockInModel }) { }
}
export class StockInCreated implements Action {
	readonly type = StockInActionTypes.StockInCreated;
	constructor(public payload: { stockIn: StockInModel }) { }
}
export class StockInUpdated implements Action {
	readonly type = StockInActionTypes.StockInUpdated;
	constructor(public payload: {
		partialStockIn: Update<StockInModel>,
		stockIn: StockInModel
	}) { }
}
export class StockInDeleted implements Action {
	readonly type = StockInActionTypes.StockInDeleted;

	constructor(public payload: { id: string }) {}
}
export class StockInPageRequested implements Action {
	readonly type = StockInActionTypes.StockInPageRequested;
	constructor(public payload: { page: QueryStockInModel }) { }
}
export class StockInPageLoaded implements Action {
	readonly type = StockInActionTypes.StockInPageLoaded;
	constructor(public payload: { stockIn: StockInModel[], totalCount: number, page: QueryStockInModel  }) { }
}
export class StockInPageCancelled implements Action {
	readonly type = StockInActionTypes.StockInPageCancelled;
}
export class StockInPageToggleLoading implements Action {
	readonly type = StockInActionTypes.StockInPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class StockInActionToggleLoading implements Action {
	readonly type = StockInActionTypes.StockInActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type StockInActions = StockInCreated
	| StockInUpdated
	| StockInDeleted
	| StockInOnServerCreated
	| StockInPageLoaded
	| StockInPageCancelled
	| StockInPageToggleLoading
	| StockInPageRequested
	| StockInActionToggleLoading;
