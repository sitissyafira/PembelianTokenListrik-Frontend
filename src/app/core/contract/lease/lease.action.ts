// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { LeaseContractModel } from './lease.model';
import { QueryleaseModel } from './querylease.model';
// Models

export enum LeaseContractActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	LeaseContractOnServerCreated = '[Edit LeaseContract Component] LeaseContract On Server Created',
	LeaseContractCreated = '[Edit LeaseContract Dialog] LeaseContract Created',
	LeaseContractUpdated = '[Edit LeaseContract Dialog] LeaseContract Updated',
	LeaseContractDeleted = '[LeaseContract List Page] LeaseContract Deleted',
	LeaseContractPageRequested = '[LeaseContract List Page] LeaseContract Page Requested',
	LeaseContractPageLoaded = '[LeaseContract API] LeaseContract Page Loaded',
	LeaseContractPageCancelled = '[LeaseContract API] LeaseContract Page Cancelled',
	LeaseContractPageToggleLoading = '[LeaseContract] LeaseContract Page Toggle Loading',
	LeaseContractActionToggleLoading = '[LeaseContract] LeaseContract Action Toggle Loading'
}
export class LeaseContractOnServerCreated implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractOnServerCreated;
	constructor(public payload: { leasecontract: LeaseContractModel }) { }
}

export class LeaseContractCreated implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractCreated;
	constructor(public payload: { leasecontract: LeaseContractModel }) { }
}


export class LeaseContractUpdated implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractUpdated;
	constructor(public payload: {
		partialLeaseContract: Update<LeaseContractModel>,
		leasecontract: LeaseContractModel
	}) { }
}

export class LeaseContractDeleted implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractDeleted;

	constructor(public payload: { id: string }) { }
}

export class LeaseContractPageRequested implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractPageRequested;
	constructor(public payload: { page: QueryleaseModel }) { }
}

export class LeaseContractPageLoaded implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractPageLoaded;
	constructor(public payload: { leasecontract: LeaseContractModel[], totalCount: number, page: QueryleaseModel }) { }
}


export class LeaseContractPageCancelled implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractPageCancelled;
}

export class LeaseContractPageToggleLoading implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class LeaseContractActionToggleLoading implements Action {
	readonly type = LeaseContractActionTypes.LeaseContractActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type LeaseContractActions = LeaseContractCreated
	| LeaseContractUpdated
	| LeaseContractDeleted
	| LeaseContractOnServerCreated
	| LeaseContractPageLoaded
	| LeaseContractPageCancelled
	| LeaseContractPageToggleLoading
	| LeaseContractPageRequested
	| LeaseContractActionToggleLoading;
