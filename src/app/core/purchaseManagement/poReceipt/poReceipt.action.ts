import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PoReceiptModel } from './poReceipt.model';
import { QueryPoReceiptModel } from './querypoReceipt.model';

export enum PoReceiptActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PoReceiptOnServerCreated = '[Edit PoReceipt Component] PoReceipt On Server Created',
	PoReceiptCreated = '[Edit PoReceipt Dialog] PoReceipt Created',
	PoReceiptUpdated = '[Edit PoReceipt Dialog] PoReceipt Updated',
	PoReceiptDeleted = '[PoReceipt List Page] PoReceipt Deleted',
	PoReceiptPageRequested = '[PoReceipt List Page] PoReceipt Page Requested',
	PoReceiptPageLoaded = '[PoReceipt API] PoReceipt Page Loaded',
	PoReceiptPageCancelled = '[PoReceipt API] PoReceipt Page Cancelled',
	PoReceiptPageToggleLoading = '[PoReceipt] PoReceipt Page Toggle Loading',
	PoReceiptActionToggleLoading = '[PoReceipt] PoReceipt Action Toggle Loading'
}
export class PoReceiptOnServerCreated implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptOnServerCreated;
	constructor(public payload: { poReceipt: PoReceiptModel }) { }
}
export class PoReceiptCreated implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptCreated;
	constructor(public payload: { poReceipt: PoReceiptModel }) { }
}
export class PoReceiptUpdated implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptUpdated;
	constructor(public payload: {
		partialPoReceipt: Update<PoReceiptModel>,
		poReceipt: PoReceiptModel
	}) { }
}
export class PoReceiptDeleted implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptDeleted;

	constructor(public payload: { id: string }) {}
}
export class PoReceiptPageRequested implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptPageRequested;
	constructor(public payload: { page: QueryPoReceiptModel }) { }
}
export class PoReceiptPageLoaded implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptPageLoaded;
	constructor(public payload: { poReceipt: PoReceiptModel[], totalCount: number, page: QueryPoReceiptModel  }) { }
}
export class PoReceiptPageCancelled implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptPageCancelled;
}
export class PoReceiptPageToggleLoading implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class PoReceiptActionToggleLoading implements Action {
	readonly type = PoReceiptActionTypes.PoReceiptActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type PoReceiptActions = PoReceiptCreated
	| PoReceiptUpdated
	| PoReceiptDeleted
	| PoReceiptOnServerCreated
	| PoReceiptPageLoaded
	| PoReceiptPageCancelled
	| PoReceiptPageToggleLoading
	| PoReceiptPageRequested
	| PoReceiptActionToggleLoading;
