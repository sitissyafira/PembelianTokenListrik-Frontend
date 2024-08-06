// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { RentalModel } from './rental.model';
import { QueryRentalModel } from './queryrental.model';
// Models

export enum RentalActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	RentalOnServerCreated = '[Edit Rental Component] Rental On Server Created',
	RentalCreated = '[Edit Rental Dialog] Rental Created',
	RentalUpdated = '[Edit Rental Dialog] Rental Updated',
	RentalDeleted = '[Rental List Page] Rental Deleted',
	RentalPageRequested = '[Rental List Page] Rental Page Requested',
	RentalPageLoaded = '[Rental API] Rental Page Loaded',
	RentalPageCancelled = '[Rental API] Rental Page Cancelled',
	RentalPageToggleLoading = '[Rental] Rental Page Toggle Loading',
	RentalActionToggleLoading = '[Rental] Rental Action Toggle Loading'
}
export class RentalOnServerCreated implements Action {
	readonly type = RentalActionTypes.RentalOnServerCreated;
	constructor(public payload: { rental: RentalModel }) { }
}

export class RentalCreated implements Action {
	readonly type = RentalActionTypes.RentalCreated;
	constructor(public payload: { rental: RentalModel }) { }
}


export class RentalUpdated implements Action {
	readonly type = RentalActionTypes.RentalUpdated;
	constructor(public payload: {
		partialRental: Update<RentalModel>,
		rental: RentalModel
	}) { }
}

export class RentalDeleted implements Action {
	readonly type = RentalActionTypes.RentalDeleted;

	constructor(public payload: { id: string }) {}
}

export class RentalPageRequested implements Action {
	readonly type = RentalActionTypes.RentalPageRequested;
	constructor(public payload: { page: QueryRentalModel }) { }
}

export class RentalPageLoaded implements Action {
	readonly type = RentalActionTypes.RentalPageLoaded;
	constructor(public payload: { rental: RentalModel[], totalCount: number, page: QueryRentalModel  }) { }
}


export class RentalPageCancelled implements Action {
	readonly type = RentalActionTypes.RentalPageCancelled;
}

export class RentalPageToggleLoading implements Action {
	readonly type = RentalActionTypes.RentalPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class RentalActionToggleLoading implements Action {
	readonly type = RentalActionTypes.RentalActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type RentalActions = RentalCreated
	| RentalUpdated
	| RentalDeleted
	| RentalOnServerCreated
	| RentalPageLoaded
	| RentalPageCancelled
	| RentalPageToggleLoading
	| RentalPageRequested
	| RentalActionToggleLoading;
