import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { StockProductModel } from './stockProduct.model';
import { QueryStockProductModel } from './querystockProduct.model';

export enum StockProductActionTypes {
	AllUsersRequested = '[Block Module] All StockProduct Requested',
	AllUsersLoaded = '[Block API] All StockProduct Loaded',
	StockProductOnServerCreated = '[Edit StockProduct Component] StockProduct On Server Created',
	StockProductCreated = '[Edit StockProduct Dialog] StockProduct Created',
	StockProductUpdated = '[Edit StockProduct Dialog] StockProduct Updated',
	StockProductDeleted = '[StockProduct List Page] StockProduct Deleted',
	StockProductPageRequested = '[StockProduct List Page] StockProduct Page Requested',
	StockProductPageLoaded = '[StockProduct API] StockProduct Page Loaded',
	StockProductPageCancelled = '[StockProduct API] StockProduct Page Cancelled',
	StockProductPageToggleLoading = '[StockProduct] StockProduct Page Toggle Loading',
	StockProductActionToggleLoading = '[StockProduct] StockProduct Action Toggle Loading'
}
export class StockProductOnServerCreated implements Action {
	readonly type = StockProductActionTypes.StockProductOnServerCreated;
	constructor(public payload: { stockProduct: StockProductModel }) { }
}
export class StockProductCreated implements Action {
	readonly type = StockProductActionTypes.StockProductCreated;
	constructor(public payload: { stockProduct: StockProductModel }) { }
}
export class StockProductUpdated implements Action {
	readonly type = StockProductActionTypes.StockProductUpdated;
	constructor(public payload: {
		partialStockProduct: Update<StockProductModel>,
		stockProduct: StockProductModel
	}) { }
}
export class StockProductDeleted implements Action {
	readonly type = StockProductActionTypes.StockProductDeleted;

	constructor(public payload: { id: string }) {}
}
export class StockProductPageRequested implements Action {
	readonly type = StockProductActionTypes.StockProductPageRequested;
	constructor(public payload: { page: QueryStockProductModel }) { }
}
export class StockProductPageLoaded implements Action {
	readonly type = StockProductActionTypes.StockProductPageLoaded;
	constructor(public payload: { stockProduct: StockProductModel[], totalCount: number, page: QueryStockProductModel  }) { }
}
export class StockProductPageCancelled implements Action {
	readonly type = StockProductActionTypes.StockProductPageCancelled;
}
export class StockProductPageToggleLoading implements Action {
	readonly type = StockProductActionTypes.StockProductPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class StockProductActionToggleLoading implements Action {
	readonly type = StockProductActionTypes.StockProductActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type StockProductActions = StockProductCreated
	| StockProductUpdated
	| StockProductDeleted
	| StockProductOnServerCreated
	| StockProductPageLoaded
	| StockProductPageCancelled
	| StockProductPageToggleLoading
	| StockProductPageRequested
	| StockProductActionToggleLoading;
