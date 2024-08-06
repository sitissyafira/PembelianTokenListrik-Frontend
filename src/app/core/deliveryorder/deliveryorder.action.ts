// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { DeliveryorderModel } from './deliveryorder.model';
import { QueryDeliveryorderModel } from './querydeliveryorder.model';
// Models

export enum DeliveryorderActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	DeliveryorderOnServerCreated = '[Edit Deliveryorder Component] Deliveryorder On Server Created',
	DeliveryorderCreated = '[Edit Deliveryorder Dialog] Deliveryorder Created',
	DeliveryorderUpdated = '[Edit Deliveryorder Dialog] Deliveryorder Updated',
	DeliveryorderDeleted = '[Deliveryorder List Page] Deliveryorder Deleted',

	DeliveryorderPageRequested = '[Deliveryorder List Page] Deliveryorder Page Requested',
	DeliveryorderPageRequestedVisit = '[Deliveryorder List Page] Deliveryorder Page Requested for Visit',
	DeliveryorderPageRequestedFixed = '[Deliveryorder List Page] Deliveryorder Page Requested for Fixed',



	DeliveryorderPageLoaded = '[Deliveryorder API] Deliveryorder Page Loaded',
	DeliveryorderPageCancelled = '[Deliveryorder API] Deliveryorder Page Cancelled',
	DeliveryorderPageToggleLoading = '[Deliveryorder] Deliveryorder Page Toggle Loading',
	DeliveryorderActionToggleLoading = '[Deliveryorder] Deliveryorder Action Toggle Loading'



}


export class DeliveryorderOnServerCreated implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderOnServerCreated;
	constructor(public payload: { deliveryorder: DeliveryorderModel }) { }
}

export class DeliveryorderCreated implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderCreated;
	constructor(public payload: { deliveryorder: DeliveryorderModel }) { }
}


export class DeliveryorderUpdated implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderUpdated;
	constructor(public payload: {
		partialDeliveryorder: Update<DeliveryorderModel>,
		deliveryorder: DeliveryorderModel
	}) { }
}

export class DeliveryorderDeleted implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderDeleted;

	constructor(public payload: { id: string }) {}
}

export class DeliveryorderPageRequested implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageRequested;
	constructor(public payload: { page: QueryDeliveryorderModel }) { }
}

export class DeliveryorderPageLoaded implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageLoaded;
	constructor(public payload: { deliveryorder: DeliveryorderModel[], totalCount: number, page: QueryDeliveryorderModel  }) { }
}


export class DeliveryorderPageCancelled implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageCancelled;
}

export class DeliveryorderPageToggleLoading implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DeliveryorderActionToggleLoading implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class DeliveryorderPageRequestedVisit implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageRequestedVisit;
	constructor(public payload: { page: QueryDeliveryorderModel }) { }
}

export class DeliveryorderPageRequestedFixed implements Action {
	readonly type = DeliveryorderActionTypes.DeliveryorderPageRequestedFixed;
	constructor(public payload: { page: QueryDeliveryorderModel }) { }
}

export type DeliveryorderActions = DeliveryorderCreated
	| DeliveryorderUpdated
	| DeliveryorderDeleted
	| DeliveryorderOnServerCreated
	| DeliveryorderPageLoaded
	| DeliveryorderPageCancelled
	| DeliveryorderPageToggleLoading

	| DeliveryorderPageRequested
	| DeliveryorderPageRequestedVisit
	| DeliveryorderPageRequestedFixed
	| DeliveryorderActionToggleLoading;
