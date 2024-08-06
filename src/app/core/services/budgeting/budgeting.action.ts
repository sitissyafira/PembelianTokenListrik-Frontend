// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { BudgetingModel } from './budgeting.model';
import { QueryBudgetingModel } from './querybudgeting.model';
// Models

export enum BudgetingActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	BudgetingOnServerCreated = '[Edit Budgeting Component] Budgeting On Server Created',
	BudgetingCreated = '[Edit Budgeting Dialog] Budgeting Created',
	BudgetingUpdated = '[Edit Budgeting Dialog] Budgeting Updated',
	BudgetingDeleted = '[Budgeting List Page] Budgeting Deleted',
	BudgetingPageRequested = '[Budgeting List Page] Budgeting Page Requested',
	BudgetingPageLoaded = '[Budgeting API] Budgeting Page Loaded',
	BudgetingPageCancelled = '[Budgeting API] Budgeting Page Cancelled',
	BudgetingPageToggleLoading = '[Budgeting] Budgeting Page Toggle Loading',
	BudgetingActionToggleLoading = '[Budgeting] Budgeting Action Toggle Loading'
}
export class BudgetingOnServerCreated implements Action {
	readonly type = BudgetingActionTypes.BudgetingOnServerCreated;
	constructor(public payload: { budgeting: BudgetingModel }) { }
}

export class BudgetingCreated implements Action {
	readonly type = BudgetingActionTypes.BudgetingCreated;
	constructor(public payload: { budgeting: BudgetingModel }) { }
}


export class BudgetingDeleted implements Action {
	readonly type = BudgetingActionTypes.BudgetingDeleted;

	constructor(public payload: { id: string }) {}
}

export class BudgetingUpdated implements Action {
	readonly type = BudgetingActionTypes.BudgetingUpdated;
	constructor(public payload: {
		partialBudgeting: Update<BudgetingModel>,
		budgeting: BudgetingModel
	}) { }
}



export class BudgetingPageRequested implements Action {
	readonly type = BudgetingActionTypes.BudgetingPageRequested;
	constructor(public payload: { page: QueryBudgetingModel }) { }
}

export class BudgetingPageLoaded implements Action {
	readonly type = BudgetingActionTypes.BudgetingPageLoaded;
	constructor(public payload: { budgeting: BudgetingModel[], totalCount: number, page: QueryBudgetingModel  }) { }
}


export class BudgetingPageCancelled implements Action {
	readonly type = BudgetingActionTypes.BudgetingPageCancelled;
}

export class BudgetingPageToggleLoading implements Action {
	readonly type = BudgetingActionTypes.BudgetingPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BudgetingActionToggleLoading implements Action {
	readonly type = BudgetingActionTypes.BudgetingActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BudgetingActions = BudgetingCreated
	| BudgetingUpdated
	| BudgetingDeleted
	| BudgetingOnServerCreated
	| BudgetingPageLoaded
	| BudgetingPageCancelled
	| BudgetingPageToggleLoading
	| BudgetingPageRequested
	| BudgetingActionToggleLoading;
