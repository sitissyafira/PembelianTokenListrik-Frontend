// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AdjustmentModel } from './adjustment.model';
import { QueryAdjustmentModel } from './queryadjustment.model';
// Models

export enum AdjustmentActionTypes {
	AllUsersRequested = '[Adjustment Module] All Adjustment Requested',
	AllUsersLoaded = '[Adjustment API] All Adjustment Loaded',
	AdjustmentOnServerCreated = '[Edit Adjustment Component] Adjustment On Server Created',
	AdjustmentCreated = '[Edit Adjustment Dialog] Adjustment Created',
	AdjustmentUpdated = '[Edit Adjustment Dialog] Adjustment Updated',
	AdjustmentDeleted = '[Adjustment List Page] Adjustment Deleted',
	AdjustmentPageRequested = '[Adjustment List Page] Adjustment Page Requested',
	AdjustmentPageLoaded = '[Adjustment API] Adjustment Page Loaded',
	AdjustmentPageCancelled = '[Adjustment API] Adjustment Page Cancelled',
	AdjustmentPageToggleLoading = '[Adjustment] Adjustment Page Toggle Loading',
	AdjustmentActionToggleLoading = '[Adjustment] Adjustment Action Toggle Loading'
}
export class AdjustmentOnServerCreated implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentOnServerCreated;
	constructor(public payload: { adjustment: AdjustmentModel }) { }
}

export class AdjustmentCreated implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentCreated;
	constructor(public payload: { adjustment: AdjustmentModel }) { }
}


export class AdjustmentUpdated implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentUpdated;
	constructor(public payload: {
		padjustmenttialAdjustment: Update<AdjustmentModel>,
		adjustment: AdjustmentModel
	}) { }
}

export class AdjustmentDeleted implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentDeleted;

	constructor(public payload: { id: string }) { }
}

export class AdjustmentPageRequested implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentPageRequested;
	constructor(public payload: { page: QueryAdjustmentModel }) { }
}

export class AdjustmentPageLoaded implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentPageLoaded;
	constructor(public payload: { adjustment: AdjustmentModel[], totalCount: number, page: QueryAdjustmentModel }) { }
}


export class AdjustmentPageCancelled implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentPageCancelled;
}

export class AdjustmentPageToggleLoading implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AdjustmentActionToggleLoading implements Action {
	readonly type = AdjustmentActionTypes.AdjustmentActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AdjustmentActions = AdjustmentCreated
	| AdjustmentUpdated
	| AdjustmentDeleted
	| AdjustmentOnServerCreated
	| AdjustmentPageLoaded
	| AdjustmentPageCancelled
	| AdjustmentPageToggleLoading
	| AdjustmentPageRequested
	| AdjustmentActionToggleLoading;
