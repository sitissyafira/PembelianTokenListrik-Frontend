// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { TransactionsModel } from './transactions.model';
import { QueryTransactionsModel } from './querytransactions.model';
// Models

export enum TransactionsActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TransactionsOnServerCreated = '[Edit Transactions Component] Transactions On Server Created',
	TransactionsCreated = '[Edit Transactions Dialog] Transactions Created',
	TransactionsUpdated = '[Edit Transactions Dialog] Transactions Updated',
	TransactionsDeleted = '[Transactions List Page] Transactions Deleted',
	TransactionsPageRequested = '[Transactions List Page] Transactions Page Requested',
	TransactionsPageLoaded = '[Transactions API] Transactions Page Loaded',
	TransactionsPageCancelled = '[Transactions API] Transactions Page Cancelled',
	TransactionsPageToggleLoading = '[Transactions] Transactions Page Toggle Loading',
	TransactionsActionToggleLoading = '[Transactions] Transactions Action Toggle Loading'
}
export class TransactionsOnServerCreated implements Action {
	readonly type = TransactionsActionTypes.TransactionsOnServerCreated;
	constructor(public payload: { transactions: TransactionsModel }) { }
}

export class TransactionsCreated implements Action {
	readonly type = TransactionsActionTypes.TransactionsCreated;
	constructor(public payload: { transactions: TransactionsModel }) { }
}


export class TransactionsUpdated implements Action {
	readonly type = TransactionsActionTypes.TransactionsUpdated;
	constructor(public payload: {
		partialTransactions: Update<TransactionsModel>,
		transactions: TransactionsModel
	}) { }
}

export class TransactionsDeleted implements Action {
	readonly type = TransactionsActionTypes.TransactionsDeleted;

	constructor(public payload: { id: string }) { }
}

export class TransactionsPageRequested implements Action {
	readonly type = TransactionsActionTypes.TransactionsPageRequested;
	constructor(public payload: { page: QueryTransactionsModel }) { }
}

export class TransactionsPageLoaded implements Action {
	readonly type = TransactionsActionTypes.TransactionsPageLoaded;
	constructor(public payload: { transactions: TransactionsModel[], totalCount: number, page: QueryTransactionsModel }) { }
}


export class TransactionsPageCancelled implements Action {
	readonly type = TransactionsActionTypes.TransactionsPageCancelled;
}

export class TransactionsPageToggleLoading implements Action {
	readonly type = TransactionsActionTypes.TransactionsPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class TransactionsActionToggleLoading implements Action {
	readonly type = TransactionsActionTypes.TransactionsActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type TransactionsActions = TransactionsCreated
	| TransactionsUpdated
	| TransactionsDeleted
	| TransactionsOnServerCreated
	| TransactionsPageLoaded
	| TransactionsPageCancelled
	| TransactionsPageToggleLoading
	| TransactionsPageRequested
	| TransactionsActionToggleLoading;
