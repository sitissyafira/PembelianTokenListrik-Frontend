import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { BillLogModel } from './billLog.model';
import { QueryBillLogModel } from './querybillLog.model';

export enum BillLogActionTypes {
	AllUsersRequested = '[BillLog Module] All BillLog Requested',
	AllUsersLoaded = '[BillLog API] All BillLog Loaded',
	BillLogOnServerCreated = '[Edit BillLog Component] BillLog On Server Created',
	BillLogCreated = '[Edit BillLog Dialog] BillLog Created',
	BillLogUpdated = '[Edit BillLog Dialog] BillLog Updated',
	BillLogDeleted = '[BillLog List Page] BillLog Deleted',
	BillLogPageRequested = '[BillLog List Page] BillLog Page Requested',
	BillLogPageLoaded = '[BillLog API] BillLog Page Loaded',
	BillLogPageCancelled = '[BillLog API] BillLog Page Cancelled',
	BillLogPageToggleLoading = '[BillLog] BillLog Page Toggle Loading',
	BillLogActionToggleLoading = '[BillLog] BillLog Action Toggle Loading'
}
export class BillLogOnServerCreated implements Action {
	readonly type = BillLogActionTypes.BillLogOnServerCreated;
	constructor(public payload: { billLog: BillLogModel }) { }
}

export class BillLogCreated implements Action {
	readonly type = BillLogActionTypes.BillLogCreated;
	constructor(public payload: { billLog: BillLogModel }) { }
}

export class BillLogUpdated implements Action {
	readonly type = BillLogActionTypes.BillLogUpdated;
	constructor(public payload: {
		partialBillLog: Update<BillLogModel>,
		billLog: BillLogModel
	}) { }
}

export class BillLogDeleted implements Action {
	readonly type = BillLogActionTypes.BillLogDeleted;

	constructor(public payload: { id: string }) {}
}

export class BillLogPageRequested implements Action {
	readonly type = BillLogActionTypes.BillLogPageRequested;
	constructor(public payload: { page: QueryBillLogModel }) { }
}

export class BillLogPageLoaded implements Action {
	readonly type = BillLogActionTypes.BillLogPageLoaded;
	constructor(public payload: { billLog: BillLogModel[], totalCount: number, page: QueryBillLogModel  }) { }
}


export class BillLogPageCancelled implements Action {
	readonly type = BillLogActionTypes.BillLogPageCancelled;
}

export class BillLogPageToggleLoading implements Action {
	readonly type = BillLogActionTypes.BillLogPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BillLogActionToggleLoading implements Action {
	readonly type = BillLogActionTypes.BillLogActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BillLogActions = BillLogCreated
	| BillLogUpdated
	| BillLogDeleted
	| BillLogOnServerCreated
	| BillLogPageLoaded
	| BillLogPageCancelled
	| BillLogPageToggleLoading
	| BillLogPageRequested
	| BillLogActionToggleLoading;
