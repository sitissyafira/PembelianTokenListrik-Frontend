// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { OwnershipContractModel } from './ownership.model';
import { QueryOwnerTransactionModel } from './queryowner.model';
// Models


export enum OwnershipContractActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	OwnershipContractOnServerCreated = '[Edit OwnershipContract Component] OwnershipContract On Server Created',
	OwnershipContractCreated = '[Edit OwnershipContract Dialog] OwnershipContract Created',
	OwnershipContractUpdated = '[Edit OwnershipContract Dialog] OwnershipContract Updated',
	OwnershipContractDeleted = '[OwnershipContract List Page] OwnershipContract Deleted',
	OwnershipContractPageRequested = '[OwnershipContract List Page] OwnershipContract Page Requested',
	OwnershipContractPageLoaded = '[OwnershipContract API] OwnershipContract Page Loaded',
	OwnershipContractPageCancelled = '[OwnershipContract API] OwnershipContract Page Cancelled',
	OwnershipContractPageToggleLoading = '[OwnershipContract] OwnershipContract Page Toggle Loading',
	OwnershipContractActionToggleLoading = '[OwnershipContract] OwnershipContract Action Toggle Loading'
}
export class OwnershipContractOnServerCreated implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractOnServerCreated;
	constructor(public payload: { ownershipcontract: OwnershipContractModel }) { }
}

export class OwnershipContractCreated implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractCreated;
	constructor(public payload: { ownershipcontract: OwnershipContractModel }) { }
}


export class OwnershipContractUpdated implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractUpdated;
	constructor(public payload: {
		partialOwnershipContract: Update<OwnershipContractModel>,
		ownershipcontract: OwnershipContractModel
	}) { }
}

export class OwnershipContractDeleted implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractDeleted;

	constructor(public payload: { id: string }) {}
}

export class OwnershipContractPageRequested implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractPageRequested;
	constructor(public payload: { page: QueryOwnerTransactionModel }) { }
}

export class OwnershipContractPageLoaded implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractPageLoaded;
	constructor(public payload: { ownershipcontract: OwnershipContractModel[], totalCount: number, page: QueryOwnerTransactionModel  }) { }
}


export class OwnershipContractPageCancelled implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractPageCancelled;
}

export class OwnershipContractPageToggleLoading implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class OwnershipContractActionToggleLoading implements Action {
	readonly type = OwnershipContractActionTypes.OwnershipContractActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type OwnershipContractActions = OwnershipContractCreated
	| OwnershipContractUpdated
	| OwnershipContractDeleted
	| OwnershipContractOnServerCreated
	| OwnershipContractPageLoaded
	| OwnershipContractPageCancelled
	| OwnershipContractPageToggleLoading
	| OwnershipContractPageRequested
	| OwnershipContractActionToggleLoading;
