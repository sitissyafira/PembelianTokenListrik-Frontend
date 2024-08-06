// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { EmergencyModel } from './emergency.model';
import { QueryEmergencyModel } from './queryemergency.model';
// Models

export enum EmergencyActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	EmergencyOnServerCreated = '[Edit Emergency Component] Emergency On Server Created',
	EmergencyCreated = '[Edit Emergency Dialog] Emergency Created',
	EmergencyUpdated = '[Edit Emergency Dialog] Emergency Updated',
	EmergencyDeleted = '[Emergency List Page] Emergency Deleted',
	EmergencyPageRequested = '[Emergency List Page] Emergency Page Requested',
	EmergencyPageLoaded = '[Emergency API] Emergency Page Loaded',
	EmergencyPageCancelled = '[Emergency API] Emergency Page Cancelled',
	EmergencyPageToggleLoading = '[Emergency] Emergency Page Toggle Loading',
	EmergencyActionToggleLoading = '[Emergency] Emergency Action Toggle Loading'
}
export class EmergencyOnServerCreated implements Action {
	readonly type = EmergencyActionTypes.EmergencyOnServerCreated;
	constructor(public payload: { emergency: EmergencyModel }) { }
}

export class EmergencyCreated implements Action {
	readonly type = EmergencyActionTypes.EmergencyCreated;
	constructor(public payload: { emergency: EmergencyModel }) { }
}


export class EmergencyUpdated implements Action {
	readonly type = EmergencyActionTypes.EmergencyUpdated;
	constructor(public payload: {
		partialEmergency: Update<EmergencyModel>,
		emergency: EmergencyModel
	}) { }
}

export class EmergencyDeleted implements Action {
	readonly type = EmergencyActionTypes.EmergencyDeleted;

	constructor(public payload: { id: string }) {}
}

export class EmergencyPageRequested implements Action {
	readonly type = EmergencyActionTypes.EmergencyPageRequested;
	constructor(public payload: { page: QueryEmergencyModel }) { }
}

export class EmergencyPageLoaded implements Action {
	readonly type = EmergencyActionTypes.EmergencyPageLoaded;
	constructor(public payload: { emergency: EmergencyModel[], totalCount: number, page: QueryEmergencyModel  }) { }
}


export class EmergencyPageCancelled implements Action {
	readonly type = EmergencyActionTypes.EmergencyPageCancelled;
}

export class EmergencyPageToggleLoading implements Action {
	readonly type = EmergencyActionTypes.EmergencyPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class EmergencyActionToggleLoading implements Action {
	readonly type = EmergencyActionTypes.EmergencyActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type EmergencyActions = EmergencyCreated
	| EmergencyUpdated
	| EmergencyDeleted
	| EmergencyOnServerCreated
	| EmergencyPageLoaded
	| EmergencyPageCancelled
	| EmergencyPageToggleLoading
	| EmergencyPageRequested
	| EmergencyActionToggleLoading;
