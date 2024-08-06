// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { VoidBillModel } from './voidBill.model';
// Models
import { QueryVoidBillModel } from './queryvoidBill.model';

export enum VoidBillActionTypes {
	AllUsersRequested = '[VoidBill Module] All VoidBill Requested',
	AllUsersLoaded = '[VoidBill API] All VoidBill Loaded',
	VoidBillOnServerCreated = '[Edit VoidBill Component] VoidBill On Server Created',
	VoidBillCreated = '[Edit VoidBill Dialog] VoidBill Created',
	VoidBillUpdated = '[Edit VoidBill Dialog] VoidBill Updated',
	VoidBillDeleted = '[VoidBill List Page] VoidBill Deleted',
	VoidBillPageRequested = '[VoidBill List Page] VoidBill Page Requested',
	VoidBillPageLoaded = '[VoidBill API] VoidBill Page Loaded',
	VoidBillPageCancelled = '[VoidBill API] VoidBill Page Cancelled',
	VoidBillPageToggleLoading = '[VoidBill] VoidBill Page Toggle Loading',
	VoidBillActionToggleLoading = '[VoidBill] VoidBill Action Toggle Loading'
}
export class VoidBillOnServerCreated implements Action {
	readonly type = VoidBillActionTypes.VoidBillOnServerCreated;
	constructor(public payload: { voidBill: VoidBillModel }) { }
}

export class VoidBillCreated implements Action {
	readonly type = VoidBillActionTypes.VoidBillCreated;
	constructor(public payload: { voidBill: VoidBillModel }) { }
}


export class VoidBillUpdated implements Action {
	readonly type = VoidBillActionTypes.VoidBillUpdated;
	constructor(public payload: {
		partialVoidBill: Update<VoidBillModel>,
		voidBill: VoidBillModel
	}) { }
}

export class VoidBillDeleted implements Action {
	readonly type = VoidBillActionTypes.VoidBillDeleted;

	constructor(public payload: { id: string }) { }
}

export class VoidBillPageRequested implements Action {
	readonly type = VoidBillActionTypes.VoidBillPageRequested;
	constructor(public payload: { page: QueryVoidBillModel }) { }
}

export class VoidBillPageLoaded implements Action {
	readonly type = VoidBillActionTypes.VoidBillPageLoaded;
	constructor(public payload: { voidBill: VoidBillModel[], totalCount: number, page: QueryVoidBillModel }) { }
}


export class VoidBillPageCancelled implements Action {
	readonly type = VoidBillActionTypes.VoidBillPageCancelled;
}

export class VoidBillPageToggleLoading implements Action {
	readonly type = VoidBillActionTypes.VoidBillPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class VoidBillActionToggleLoading implements Action {
	readonly type = VoidBillActionTypes.VoidBillActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type VoidBillActions = VoidBillCreated
	| VoidBillUpdated
	| VoidBillDeleted
	| VoidBillOnServerCreated
	| VoidBillPageLoaded
	| VoidBillPageCancelled
	| VoidBillPageToggleLoading
	| VoidBillPageRequested
	| VoidBillActionToggleLoading;
