import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PurchaseOrderModel } from './purchaseOrder.model';
import { QueryPurchaseOrderModel } from './querypurchaseOrder.model';

export enum PurchaseOrderActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PurchaseOrderOnServerCreated = '[Edit PurchaseOrder Component] PurchaseOrder On Server Created',
	PurchaseOrderCreated = '[Edit PurchaseOrder Dialog] PurchaseOrder Created',
	PurchaseOrderUpdated = '[Edit PurchaseOrder Dialog] PurchaseOrder Updated',
	PurchaseOrderDeleted = '[PurchaseOrder List Page] PurchaseOrder Deleted',
	PurchaseOrderPageRequested = '[PurchaseOrder List Page] PurchaseOrder Page Requested',
	PurchaseOrderPageLoaded = '[PurchaseOrder API] PurchaseOrder Page Loaded',
	PurchaseOrderPageCancelled = '[PurchaseOrder API] PurchaseOrder Page Cancelled',
	PurchaseOrderPageToggleLoading = '[PurchaseOrder] PurchaseOrder Page Toggle Loading',
	PurchaseOrderActionToggleLoading = '[PurchaseOrder] PurchaseOrder Action Toggle Loading'
}
export class PurchaseOrderOnServerCreated implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderOnServerCreated;
	constructor(public payload: { purchaseOrder: PurchaseOrderModel }) { }
}
export class PurchaseOrderCreated implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderCreated;
	constructor(public payload: { purchaseOrder: PurchaseOrderModel }) { }
}
export class PurchaseOrderUpdated implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderUpdated;
	constructor(public payload: {
		partialPurchaseOrder: Update<PurchaseOrderModel>,
		purchaseOrder: PurchaseOrderModel
	}) { }
}
export class PurchaseOrderDeleted implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderDeleted;

	constructor(public payload: { id: string }) {}
}
export class PurchaseOrderPageRequested implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderPageRequested;
	constructor(public payload: { page: QueryPurchaseOrderModel }) { }
}
export class PurchaseOrderPageLoaded implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderPageLoaded;
	constructor(public payload: { purchaseOrder: PurchaseOrderModel[], totalCount: number, page: QueryPurchaseOrderModel  }) { }
}
export class PurchaseOrderPageCancelled implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderPageCancelled;
}
export class PurchaseOrderPageToggleLoading implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class PurchaseOrderActionToggleLoading implements Action {
	readonly type = PurchaseOrderActionTypes.PurchaseOrderActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type PurchaseOrderActions = PurchaseOrderCreated
	| PurchaseOrderUpdated
	| PurchaseOrderDeleted
	| PurchaseOrderOnServerCreated
	| PurchaseOrderPageLoaded
	| PurchaseOrderPageCancelled
	| PurchaseOrderPageToggleLoading
	| PurchaseOrderPageRequested
	| PurchaseOrderActionToggleLoading;
