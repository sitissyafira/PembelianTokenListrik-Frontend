// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RevenueModel } from './revenue.model';
import { QueryRevenueModel } from './queryrevenue.model';
// Models

export enum RevenueActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RevenueOnServerCreated = '[Edit Revenue Component] Revenue On Server Created',
	RevenueCreated = '[Edit Revenue Dialog] Revenue Created',
	RevenueUpdated = '[Edit Revenue Dialog] Revenue Updated',
	RevenueDeleted = '[Revenue List Page] Revenue Deleted',
	RevenuePageRequested = '[Revenue List Page] Revenue Page Requested',
	RevenuePageLoaded = '[Revenue API] Revenue Page Loaded',
	RevenuePageCancelled = '[Revenue API] Revenue Page Cancelled',
	RevenuePageToggleLoading = '[Revenue] Revenue Page Toggle Loading',
	RevenueActionToggleLoading = '[Revenue] Revenue Action Toggle Loading'
}
export class RevenueOnServerCreated implements Action {
	readonly type = RevenueActionTypes.RevenueOnServerCreated;
	constructor(public payload: { revenue: RevenueModel }) { }
}

export class RevenueCreated implements Action {
	readonly type = RevenueActionTypes.RevenueCreated;
	constructor(public payload: { revenue: RevenueModel }) { }
}


export class RevenueUpdated implements Action {
	readonly type = RevenueActionTypes.RevenueUpdated;
	constructor(public payload: {
		partialRevenue: Update<RevenueModel>,
		revenue: RevenueModel
	}) { }
}

export class RevenueDeleted implements Action {
	readonly type = RevenueActionTypes.RevenueDeleted;

	constructor(public payload: { id: string }) {}
}

export class RevenuePageRequested implements Action {
	readonly type = RevenueActionTypes.RevenuePageRequested;
	constructor(public payload: { page: QueryRevenueModel }) { }
}

export class RevenuePageLoaded implements Action {
	readonly type = RevenueActionTypes.RevenuePageLoaded;
	constructor(public payload: { revenue: RevenueModel[], totalCount: number, page: QueryRevenueModel  }) { }
}


export class RevenuePageCancelled implements Action {
	readonly type = RevenueActionTypes.RevenuePageCancelled;
}

export class RevenuePageToggleLoading implements Action {
	readonly type = RevenueActionTypes.RevenuePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RevenueActionToggleLoading implements Action {
	readonly type = RevenueActionTypes.RevenueActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RevenueActions = RevenueCreated
	| RevenueUpdated
	| RevenueDeleted
	| RevenueOnServerCreated
	| RevenuePageLoaded
	| RevenuePageCancelled
	| RevenuePageToggleLoading
	| RevenuePageRequested
	| RevenueActionToggleLoading;
