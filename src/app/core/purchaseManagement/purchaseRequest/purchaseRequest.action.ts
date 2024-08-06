import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PurchaseRequestModel } from './purchaseRequest.model';
import { QueryPurchaseRequestModel } from './querypurchaseRequest.model';

export enum PurchaseRequestActionTypes {
	AllUsersRequested = '[Block Module] All Purchase Request Requested',
	AllUsersLoaded = '[Block API] All Purchase Request Loaded',
	PurchaseRequestOnServerCreated = '[Edit PurchaseRequest Component] PurchaseRequest On Server Created',
	PurchaseRequestCreated = '[Edit PurchaseRequest Dialog] PurchaseRequest Created',
	PurchaseRequestUpdated = '[Edit PurchaseRequest Dialog] PurchaseRequest Updated',
	PurchaseRequestDeleted = '[PurchaseRequest List Page] PurchaseRequest Deleted',
	PurchaseRequestPageRequested = '[PurchaseRequest List Page] PurchaseRequest Page Requested',
	PurchaseRequestPageLoaded = '[PurchaseRequest API] PurchaseRequest Page Loaded',
	PurchaseRequestPageCancelled = '[PurchaseRequest API] PurchaseRequest Page Cancelled',
	PurchaseRequestPageToggleLoading = '[PurchaseRequest] PurchaseRequest Page Toggle Loading',
	PurchaseRequestActionToggleLoading = '[PurchaseRequest] PurchaseRequest Action Toggle Loading'
}
export class PurchaseRequestOnServerCreated implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestOnServerCreated;
	constructor(public payload: { purchaseRequest: PurchaseRequestModel }) { }
}
export class PurchaseRequestCreated implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestCreated;
	constructor(public payload: { purchaseRequest: PurchaseRequestModel }) { }
}
export class PurchaseRequestUpdated implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestUpdated;
	constructor(public payload: {
		partialPurchaseRequest: Update<PurchaseRequestModel>,
		purchaseRequest: PurchaseRequestModel
	}) { }
}
export class PurchaseRequestDeleted implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestDeleted;

	constructor(public payload: { id: string }) {}
}
export class PurchaseRequestPageRequested implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestPageRequested;
	constructor(public payload: { page: QueryPurchaseRequestModel }) { }
}
export class PurchaseRequestPageLoaded implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestPageLoaded;
	constructor(public payload: { purchaseRequest: PurchaseRequestModel[], totalCount: number, page: QueryPurchaseRequestModel  }) { }
}
export class PurchaseRequestPageCancelled implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestPageCancelled;
}
export class PurchaseRequestPageToggleLoading implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class PurchaseRequestActionToggleLoading implements Action {
	readonly type = PurchaseRequestActionTypes.PurchaseRequestActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type PurchaseRequestActions = PurchaseRequestCreated
	| PurchaseRequestUpdated
	| PurchaseRequestDeleted
	| PurchaseRequestOnServerCreated
	| PurchaseRequestPageLoaded
	| PurchaseRequestPageCancelled
	| PurchaseRequestPageToggleLoading
	| PurchaseRequestPageRequested
	| PurchaseRequestActionToggleLoading;
