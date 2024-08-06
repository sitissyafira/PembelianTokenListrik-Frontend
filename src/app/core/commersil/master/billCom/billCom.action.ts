import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { BillComModel } from './billCom.model';
import { QueryBillComModel } from './querybillCom.model';

export enum BillComActionTypes {
	AllUsersRequested = '[Block Module] All BillCom Requested',
	AllUsersLoaded = '[Block API] All BillCom Loaded',
	BillComOnServerCreated = '[Edit BillCom Component] BillCom On Server Created',
	BillComCreated = '[Edit BillCom Dialog] BillCom Created',
	BillComUpdated = '[Edit BillCom Dialog] BillCom Updated',
	BillComDeleted = '[BillCom List Page] BillCom Deleted',
	BillComPageRequested = '[BillCom List Page] BillCom Page Requested',
	BillComPageLoaded = '[BillCom API] BillCom Page Loaded',
	BillComPageCancelled = '[BillCom API] BillCom Page Cancelled',
	BillComPageToggleLoading = '[BillCom] BillCom Page Toggle Loading',
	BillComActionToggleLoading = '[BillCom] BillCom Action Toggle Loading'
}
export class BillComOnServerCreated implements Action {
	readonly type = BillComActionTypes.BillComOnServerCreated;
	constructor(public payload: { billCom: BillComModel }) { }
}
export class BillComCreated implements Action {
	readonly type = BillComActionTypes.BillComCreated;
	constructor(public payload: { billCom: BillComModel }) { }
}
export class BillComUpdated implements Action {
	readonly type = BillComActionTypes.BillComUpdated;
	constructor(public payload: {
		partialBillCom: Update<BillComModel>,
		billCom: BillComModel
	}) { }
}
export class BillComDeleted implements Action {
	readonly type = BillComActionTypes.BillComDeleted;

	constructor(public payload: { id: string }) {}
}
export class BillComPageRequested implements Action {
	readonly type = BillComActionTypes.BillComPageRequested;
	constructor(public payload: { page: QueryBillComModel }) { }
}
export class BillComPageLoaded implements Action {
	readonly type = BillComActionTypes.BillComPageLoaded;
	constructor(public payload: { billCom: BillComModel[], totalCount: number, page: QueryBillComModel  }) { }
}
export class BillComPageCancelled implements Action {
	readonly type = BillComActionTypes.BillComPageCancelled;
}
export class BillComPageToggleLoading implements Action {
	readonly type = BillComActionTypes.BillComPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class BillComActionToggleLoading implements Action {
	readonly type = BillComActionTypes.BillComActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type BillComActions = BillComCreated
	| BillComUpdated
	| BillComDeleted
	| BillComOnServerCreated
	| BillComPageLoaded
	| BillComPageCancelled
	| BillComPageToggleLoading
	| BillComPageRequested
	| BillComActionToggleLoading;
