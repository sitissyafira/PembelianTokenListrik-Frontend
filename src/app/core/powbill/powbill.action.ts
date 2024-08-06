// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PowbillModel } from './powbill.model';
import { QueryPowbillModel } from './querypowbill.model';
// Models

export enum PowbillActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PowbillOnServerCreated = '[Edit Powbill Component] Powbill On Server Created',
	PowbillCreated = '[Edit Powbill Dialog] Powbill Created',
	PowbillUpdated = '[Edit Powbill Dialog] Powbill Updated',
	PowbillDeleted = '[Powbill List Page] Powbill Deleted',
	PowbillPageRequested = '[Powbill List Page] Powbill Page Requested',
	PowbillPageLoaded = '[Powbill API] Powbill Page Loaded',
	PowbillPageCancelled = '[Powbill API] Powbill Page Cancelled',
	PowbillPageToggleLoading = '[Powbill] Powbill Page Toggle Loading',
	PowbillActionToggleLoading = '[Powbill] Powbill Action Toggle Loading'
}
export class PowbillOnServerCreated implements Action {
	readonly type = PowbillActionTypes.PowbillOnServerCreated;
	constructor(public payload: { powbill: PowbillModel }) { }
}

export class PowbillCreated implements Action {
	readonly type = PowbillActionTypes.PowbillCreated;
	constructor(public payload: { powbill: PowbillModel }) { }
}


export class PowbillUpdated implements Action {
	readonly type = PowbillActionTypes.PowbillUpdated;
	constructor(public payload: {
		partialPowbill: Update<PowbillModel>,
		powbill: PowbillModel
	}) { }
}

export class PowbillDeleted implements Action {
	readonly type = PowbillActionTypes.PowbillDeleted;

	constructor(public payload: { id: string }) {}
}

export class PowbillPageRequested implements Action {
	readonly type = PowbillActionTypes.PowbillPageRequested;
	constructor(public payload: { page: QueryPowbillModel }) { }
}

export class PowbillPageLoaded implements Action {
	readonly type = PowbillActionTypes.PowbillPageLoaded;
	constructor(public payload: { powbill: PowbillModel[], totalCount: number, page: QueryPowbillModel  }) { }
}


export class PowbillPageCancelled implements Action {
	readonly type = PowbillActionTypes.PowbillPageCancelled;
}

export class PowbillPageToggleLoading implements Action {
	readonly type = PowbillActionTypes.PowbillPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PowbillActionToggleLoading implements Action {
	readonly type = PowbillActionTypes.PowbillActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PowbillActions = PowbillCreated
	| PowbillUpdated
	| PowbillDeleted
	| PowbillOnServerCreated
	| PowbillPageLoaded
	| PowbillPageCancelled
	| PowbillPageToggleLoading
	| PowbillPageRequested
	| PowbillActionToggleLoading;
