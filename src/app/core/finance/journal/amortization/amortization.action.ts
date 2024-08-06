// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AmortizationModel } from './amortization.model';
import { QueryAmortizationModel } from './queryamortization.model';
// Models

export enum AmortizationActionTypes {
	AllUsersRequested = '[Amortization Module] All Amortization Requested',
	AllUsersLoaded = '[Amortization API] All Amortization Loaded',
	AmortizationOnServerCreated = '[Edit Amortization Component] Amortization On Server Created',
	AmortizationCreated = '[Edit Amortization Dialog] Amortization Created',
	AmortizationUpdated = '[Edit Amortization Dialog] Amortization Updated',
	AmortizationDeleted = '[Amortization List Page] Amortization Deleted',
	AmortizationPageRequested = '[Amortization List Page] Amortization Page Requested',
	AmortizationPageLoaded = '[Amortization API] Amortization Page Loaded',
	AmortizationPageCancelled = '[Amortization API] Amortization Page Cancelled',
	AmortizationPageToggleLoading = '[Amortization] Amortization Page Toggle Loading',
	AmortizationActionToggleLoading = '[Amortization] Amortization Action Toggle Loading'
}
export class AmortizationOnServerCreated implements Action {
	readonly type = AmortizationActionTypes.AmortizationOnServerCreated;
	constructor(public payload: { amortization: AmortizationModel }) { }
}

export class AmortizationCreated implements Action {
	readonly type = AmortizationActionTypes.AmortizationCreated;
	constructor(public payload: { amortization: AmortizationModel }) { }
}


export class AmortizationUpdated implements Action {
	readonly type = AmortizationActionTypes.AmortizationUpdated;
	constructor(public payload: {
		pamortizationtialAmortization: Update<AmortizationModel>,
		amortization: AmortizationModel
	}) { }
}

export class AmortizationDeleted implements Action {
	readonly type = AmortizationActionTypes.AmortizationDeleted;

	constructor(public payload: { id: string }) { }
}

export class AmortizationPageRequested implements Action {
	readonly type = AmortizationActionTypes.AmortizationPageRequested;
	constructor(public payload: { page: QueryAmortizationModel }) { }
}

export class AmortizationPageLoaded implements Action {
	readonly type = AmortizationActionTypes.AmortizationPageLoaded;
	constructor(public payload: { amortization: AmortizationModel[], totalCount: number, page: QueryAmortizationModel }) { }
}


export class AmortizationPageCancelled implements Action {
	readonly type = AmortizationActionTypes.AmortizationPageCancelled;
}

export class AmortizationPageToggleLoading implements Action {
	readonly type = AmortizationActionTypes.AmortizationPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AmortizationActionToggleLoading implements Action {
	readonly type = AmortizationActionTypes.AmortizationActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AmortizationActions = AmortizationCreated
	| AmortizationUpdated
	| AmortizationDeleted
	| AmortizationOnServerCreated
	| AmortizationPageLoaded
	| AmortizationPageCancelled
	| AmortizationPageToggleLoading
	| AmortizationPageRequested
	| AmortizationActionToggleLoading;
