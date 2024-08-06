// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { GasMeterModel } from './meter.model';
// Models
import {QueryGasMeterModel} from './querymeter.model';

export enum GasMeterActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	GasMeterOnServerCreated = '[Edit GasMeter Component] GasMeter On Server Created',
	GasMeterCreated = '[Edit GasMeter Dialog] GasMeter Created',
	GasMeterUpdated = '[Edit GasMeter Dialog] GasMeter Updated',
	GasMeterDeleted = '[GasMeter List Page] GasMeter Deleted',
	GasMeterPageRequested = '[GasMeter List Page] GasMeter Page Requested',
	GasMeterPageLoaded = '[GasMeter API] GasMeter Page Loaded',
	GasMeterPageCancelled = '[GasMeter API] GasMeter Page Cancelled',
	GasMeterPageToggleLoading = '[GasMeter] GasMeter Page Toggle Loading',
	GasMeterActionToggleLoading = '[GasMeter] GasMeter Action Toggle Loading'
}
export class GasMeterOnServerCreated implements Action {
	readonly type = GasMeterActionTypes.GasMeterOnServerCreated;
	constructor(public payload: { gasmeter: GasMeterModel }) { }
}

export class GasMeterCreated implements Action {
	readonly type = GasMeterActionTypes.GasMeterCreated;
	constructor(public payload: { gasmeter: GasMeterModel }) { }
}


export class GasMeterUpdated implements Action {
	readonly type = GasMeterActionTypes.GasMeterUpdated;
	constructor(public payload: {
		partialGasMeter: Update<GasMeterModel>,
		gasmeter: GasMeterModel
	}) { }
}

export class GasMeterDeleted implements Action {
	readonly type = GasMeterActionTypes.GasMeterDeleted;

	constructor(public payload: { id: string }) {}
}

export class GasMeterPageRequested implements Action {
	readonly type = GasMeterActionTypes.GasMeterPageRequested;
	constructor(public payload: { page: QueryGasMeterModel }) { }
}

export class GasMeterPageLoaded implements Action {
	readonly type = GasMeterActionTypes.GasMeterPageLoaded;
	constructor(public payload: { gasmeter: GasMeterModel[], totalCount: number, page: QueryGasMeterModel  }) { }
}


export class GasMeterPageCancelled implements Action {
	readonly type = GasMeterActionTypes.GasMeterPageCancelled;
}

export class GasMeterPageToggleLoading implements Action {
	readonly type = GasMeterActionTypes.GasMeterPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class GasMeterActionToggleLoading implements Action {
	readonly type = GasMeterActionTypes.GasMeterActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type GasMeterActions = GasMeterCreated
	| GasMeterUpdated
	| GasMeterDeleted
	| GasMeterOnServerCreated
	| GasMeterPageLoaded
	| GasMeterPageCancelled
	| GasMeterPageToggleLoading
	| GasMeterPageRequested
	| GasMeterActionToggleLoading;
