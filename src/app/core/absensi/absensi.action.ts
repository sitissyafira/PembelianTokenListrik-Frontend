// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AbsensiModel } from './absensi.model';
import { QueryAbsensiModel } from './queryabsensi.model';
// Models

export enum AbsensiActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AbsensiOnServerCreated = '[Edit Absensi Component] Absensi On Server Created',
	AbsensiCreated = '[Edit Absensi Dialog] Absensi Created',
	AbsensiUpdated = '[Edit Absensi Dialog] Absensi Updated',
	AbsensiDeleted = '[Absensi List Page] Absensi Deleted',
	AbsensiPageRequested = '[Absensi List Page] Absensi Page Requested',
	AbsensiPageLoaded = '[Absensi API] Absensi Page Loaded',
	AbsensiPageCancelled = '[Absensi API] Absensi Page Cancelled',
	AbsensiPageToggleLoading = '[Absensi] Absensi Page Toggle Loading',
	AbsensiActionToggleLoading = '[Absensi] Absensi Action Toggle Loading'
}
export class AbsensiOnServerCreated implements Action {
	readonly type = AbsensiActionTypes.AbsensiOnServerCreated;
	constructor(public payload: { absensi: AbsensiModel }) { }
}

export class AbsensiCreated implements Action {
	readonly type = AbsensiActionTypes.AbsensiCreated;
	constructor(public payload: { absensi: AbsensiModel }) { }
}


export class AbsensiUpdated implements Action {
	readonly type = AbsensiActionTypes.AbsensiUpdated;
	constructor(public payload: {
		partialAbsensi: Update<AbsensiModel>,
		absensi: AbsensiModel
	}) { }
}

export class AbsensiDeleted implements Action {
	readonly type = AbsensiActionTypes.AbsensiDeleted;

	constructor(public payload: { id: string }) {}
}

export class AbsensiPageRequested implements Action {
	readonly type = AbsensiActionTypes.AbsensiPageRequested;
	constructor(public payload: { page: QueryAbsensiModel }) { }
}

export class AbsensiPageLoaded implements Action {
	readonly type = AbsensiActionTypes.AbsensiPageLoaded;
	constructor(public payload: { absensi: AbsensiModel[], totalCount: number, page: QueryAbsensiModel  }) { }
}


export class AbsensiPageCancelled implements Action {
	readonly type = AbsensiActionTypes.AbsensiPageCancelled;
}

export class AbsensiPageToggleLoading implements Action {
	readonly type = AbsensiActionTypes.AbsensiPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AbsensiActionToggleLoading implements Action {
	readonly type = AbsensiActionTypes.AbsensiActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AbsensiActions = AbsensiCreated
	| AbsensiUpdated
	| AbsensiDeleted
	| AbsensiOnServerCreated
	| AbsensiPageLoaded
	| AbsensiPageCancelled
	| AbsensiPageToggleLoading
	| AbsensiPageRequested
	| AbsensiActionToggleLoading;
