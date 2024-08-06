// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PublicDeliveryorderModel } from './publicdeliveryorder.model';
import { QueryPublicDeliveryorderModel } from './querypublicdeliveryorder.model';
// Models

export enum PublicDeliveryorderActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PublicDeliveryorderOnServerCreated = '[Edit PublicDeliveryorder Component] PublicDeliveryorder On Server Created',
	PublicDeliveryorderCreated = '[Edit PublicDeliveryorder Dialog] PublicDeliveryorder Created',
	PublicDeliveryorderUpdated = '[Edit PublicDeliveryorder Dialog] PublicDeliveryorder Updated',
	PublicDeliveryorderDeleted = '[PublicDeliveryorder List Page] PublicDeliveryorder Deleted',

	PublicDeliveryorderPageRequested = '[PublicDeliveryorder List Page] PublicDeliveryorder Page Requested',
	PublicDeliveryorderPageRequestedVisit = '[PublicDeliveryorder List Page] PublicDeliveryorder Page Requested for Visit',
	PublicDeliveryorderPageRequestedFixed = '[PublicDeliveryorder List Page] PublicDeliveryorder Page Requested for Fixed',



	PublicDeliveryorderPageLoaded = '[PublicDeliveryorder API] PublicDeliveryorder Page Loaded',
	PublicDeliveryorderPageCancelled = '[PublicDeliveryorder API] PublicDeliveryorder Page Cancelled',
	PublicDeliveryorderPageToggleLoading = '[PublicDeliveryorder] PublicDeliveryorder Page Toggle Loading',
	PublicDeliveryorderActionToggleLoading = '[PublicDeliveryorder] PublicDeliveryorder Action Toggle Loading'



}


export class PublicDeliveryorderOnServerCreated implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderOnServerCreated;
	constructor(public payload: { publicDeliveryorder: PublicDeliveryorderModel }) { }
}

export class PublicDeliveryorderCreated implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderCreated;
	constructor(public payload: { publicDeliveryorder: PublicDeliveryorderModel }) { }
}


export class PublicDeliveryorderUpdated implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderUpdated;
	constructor(public payload: {
		partialPublicDeliveryorder: Update<PublicDeliveryorderModel>,
		publicDeliveryorder: PublicDeliveryorderModel
	}) { }
}

export class PublicDeliveryorderDeleted implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderDeleted;

	constructor(public payload: { id: string }) {}
}

export class PublicDeliveryorderPageRequested implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequested;
	constructor(public payload: { page: QueryPublicDeliveryorderModel }) { }
}

export class PublicDeliveryorderPageLoaded implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageLoaded;
	constructor(public payload: { publicDeliveryorder: PublicDeliveryorderModel[], totalCount: number, page: QueryPublicDeliveryorderModel  }) { }
}


export class PublicDeliveryorderPageCancelled implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageCancelled;
}

export class PublicDeliveryorderPageToggleLoading implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PublicDeliveryorderActionToggleLoading implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PublicDeliveryorderPageRequestedVisit implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequestedVisit;
	constructor(public payload: { page: QueryPublicDeliveryorderModel }) { }
}

export class PublicDeliveryorderPageRequestedFixed implements Action {
	readonly type = PublicDeliveryorderActionTypes.PublicDeliveryorderPageRequestedFixed;
	constructor(public payload: { page: QueryPublicDeliveryorderModel }) { }
}

export type PublicDeliveryorderActions = PublicDeliveryorderCreated
	| PublicDeliveryorderUpdated
	| PublicDeliveryorderDeleted
	| PublicDeliveryorderOnServerCreated
	| PublicDeliveryorderPageLoaded
	| PublicDeliveryorderPageCancelled
	| PublicDeliveryorderPageToggleLoading

	| PublicDeliveryorderPageRequested
	| PublicDeliveryorderPageRequestedVisit
	| PublicDeliveryorderPageRequestedFixed
	| PublicDeliveryorderActionToggleLoading;
