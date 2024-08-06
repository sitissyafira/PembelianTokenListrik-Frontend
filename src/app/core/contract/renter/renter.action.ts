// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RenterContractModel } from './renter.model';
import { QueryrenterModel } from './queryrenter.model';
// Models

export enum RenterContractActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RenterContractOnServerCreated = '[Edit RenterContract Component] RenterContract On Server Created',
	RenterContractCreated = '[Edit RenterContract Dialog] RenterContract Created',
	RenterContractUpdated = '[Edit RenterContract Dialog] RenterContract Updated',
	RenterContractDeleted = '[RenterContract List Page] RenterContract Deleted',
	RenterContractPageRequested = '[RenterContract List Page] RenterContract Page Requested',
	RenterContractPageLoaded = '[RenterContract API] RenterContract Page Loaded',
	RenterContractPageCancelled = '[RenterContract API] RenterContract Page Cancelled',
	RenterContractPageToggleLoading = '[RenterContract] RenterContract Page Toggle Loading',
	RenterContractActionToggleLoading = '[RenterContract] RenterContract Action Toggle Loading',
	
	RenterContractPageToggleCheckout = '[RenterContract] RenterContract Page Toggle Checkout',
	RenterContractActionToggleCheckout = '[RenterContract] RenterContract Action Toggle Checkout'
}
export class RenterContractOnServerCreated implements Action {
	readonly type = RenterContractActionTypes.RenterContractOnServerCreated;
	constructor(public payload: { rentercontract: RenterContractModel }) { }
}

export class RenterContractCreated implements Action {
	readonly type = RenterContractActionTypes.RenterContractCreated;
	constructor(public payload: { rentercontract: RenterContractModel }) { }
}


export class RenterContractUpdated implements Action {
	readonly type = RenterContractActionTypes.RenterContractUpdated;
	constructor(public payload: {
		partialRenterContract: Update<RenterContractModel>,
		rentercontract: RenterContractModel
	}) { }
}

export class RenterContractDeleted implements Action {
	readonly type = RenterContractActionTypes.RenterContractDeleted;

	constructor(public payload: { id: string }) { }
}

export class RenterContractPageRequested implements Action {
	readonly type = RenterContractActionTypes.RenterContractPageRequested;
	constructor(public payload: { page: QueryrenterModel }) { }
}

export class RenterContractPageLoaded implements Action {
	readonly type = RenterContractActionTypes.RenterContractPageLoaded;
	constructor(public payload: { rentercontract: RenterContractModel[], totalCount: number, page: QueryrenterModel }) { }
}


export class RenterContractPageCancelled implements Action {
	readonly type = RenterContractActionTypes.RenterContractPageCancelled;
}
export class RenterContractPageToggleCheckout implements Action {
	readonly type = RenterContractActionTypes.RenterContractPageToggleCheckout;
	// constructor(public payload: { isLoading: boolean }) { }
	// constructor(public payload: { page: QueryrenterModel }) { }
	constructor(public payload: { rentercontract: RenterContractModel[], totalCount: number, page: QueryrenterModel }) { }


}

export class RenterContractActionToggleCheckout implements Action {
	readonly type = RenterContractActionTypes.RenterContractActionToggleCheckout;
	constructor(public payload: { page: QueryrenterModel }) { }
	// constructor(public payload: { isLoading: boolean }) { }
	// constructor(public payload: { rentercontract: RenterContractModel[], totalCount: number, page: QueryrenterModel }) { }

}
export class RenterContractPageToggleLoading implements Action {
	readonly type = RenterContractActionTypes.RenterContractPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RenterContractActionToggleLoading implements Action {
	readonly type = RenterContractActionTypes.RenterContractActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RenterContractActions = RenterContractCreated
	| RenterContractUpdated
	| RenterContractDeleted
	| RenterContractOnServerCreated
	| RenterContractPageLoaded
	| RenterContractPageCancelled
	| RenterContractPageToggleLoading
	| RenterContractPageToggleCheckout
	| RenterContractPageRequested
	| RenterContractActionToggleLoading;
