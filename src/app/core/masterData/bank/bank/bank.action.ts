// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { BankModel } from './bank.model';
import { QueryBankModel } from './querybank.model';
// Models

export enum BankActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	BankOnServerCreated = '[Edit Bank Component] Bank On Server Created',
	BankCreated = '[Edit Bank Dialog] Bank Created',
	BankUpdated = '[Edit Bank Dialog] Bank Updated',
	BankDeleted = '[Bank List Page] Bank Deleted',
	BankPageRequested = '[Bank List Page] Bank Page Requested',
	BankPageLoaded = '[Bank API] Bank Page Loaded',
	BankPageCancelled = '[Bank API] Bank Page Cancelled',
	BankPageToggleLoading = '[Bank] Bank Page Toggle Loading',
	BankActionToggleLoading = '[Bank] Bank Action Toggle Loading'
}
export class BankOnServerCreated implements Action {
	readonly type = BankActionTypes.BankOnServerCreated;
	constructor(public payload: { bank: BankModel }) { }
}

export class BankCreated implements Action {
	readonly type = BankActionTypes.BankCreated;
	constructor(public payload: { bank: BankModel }) { }
}


export class BankUpdated implements Action {
	readonly type = BankActionTypes.BankUpdated;
	constructor(public payload: {
		partialBank: Update<BankModel>,
		bank: BankModel
	}) { }
}

export class BankDeleted implements Action {
	readonly type = BankActionTypes.BankDeleted;

	constructor(public payload: { id: string }) {}
}

export class BankPageRequested implements Action {
	readonly type = BankActionTypes.BankPageRequested;
	constructor(public payload: { page: QueryBankModel }) { }
}

export class BankPageLoaded implements Action {
	readonly type = BankActionTypes.BankPageLoaded;
	constructor(public payload: { bank: BankModel[], totalCount: number, page: QueryBankModel  }) { }
}


export class BankPageCancelled implements Action {
	readonly type = BankActionTypes.BankPageCancelled;
}

export class BankPageToggleLoading implements Action {
	readonly type = BankActionTypes.BankPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BankActionToggleLoading implements Action {
	readonly type = BankActionTypes.BankActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BankActions = BankCreated
	| BankUpdated
	| BankDeleted
	| BankOnServerCreated
	| BankPageLoaded
	| BankPageCancelled
	| BankPageToggleLoading
	| BankPageRequested
	| BankActionToggleLoading;
