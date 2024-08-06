// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { InspeksiModel } from './inspeksi.model';
import { QueryInspeksiModel } from './queryinspeksi.model';
// Models

export enum InspeksiActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	InspeksiOnServerCreated = '[Edit Inspeksi Component] Inspeksi On Server Created',
	InspeksiCreated = '[Edit Inspeksi Dialog] Inspeksi Created',
	InspeksiUpdated = '[Edit Inspeksi Dialog] Inspeksi Updated',
	InspeksiDeleted = '[Inspeksi List Page] Inspeksi Deleted',
	InspeksiPageRequested = '[Inspeksi List Page] Inspeksi Page Requested',
	InspeksiPageLoaded = '[Inspeksi API] Inspeksi Page Loaded',
	InspeksiPageCancelled = '[Inspeksi API] Inspeksi Page Cancelled',
	InspeksiPageToggleLoading = '[Inspeksi] Inspeksi Page Toggle Loading',
	InspeksiActionToggleLoading = '[Inspeksi] Inspeksi Action Toggle Loading'
}
export class InspeksiOnServerCreated implements Action {
	readonly type = InspeksiActionTypes.InspeksiOnServerCreated;
	constructor(public payload: { inspeksi: InspeksiModel }) { }
}

export class InspeksiCreated implements Action {
	readonly type = InspeksiActionTypes.InspeksiCreated;
	constructor(public payload: { inspeksi: InspeksiModel }) { }
}


export class InspeksiUpdated implements Action {
	readonly type = InspeksiActionTypes.InspeksiUpdated;
	constructor(public payload: {
		partialInspeksi: Update<InspeksiModel>,
		inspeksi: InspeksiModel
	}) { }
}

export class InspeksiDeleted implements Action {
	readonly type = InspeksiActionTypes.InspeksiDeleted;

	constructor(public payload: { id: string }) {}
}

export class InspeksiPageRequested implements Action {
	readonly type = InspeksiActionTypes.InspeksiPageRequested;
	constructor(public payload: { page: QueryInspeksiModel }) { }
}

export class InspeksiPageLoaded implements Action {
	readonly type = InspeksiActionTypes.InspeksiPageLoaded;
	constructor(public payload: { inspeksi: InspeksiModel[], totalCount: number, page: QueryInspeksiModel  }) { }
}


export class InspeksiPageCancelled implements Action {
	readonly type = InspeksiActionTypes.InspeksiPageCancelled;
}

export class InspeksiPageToggleLoading implements Action {
	readonly type = InspeksiActionTypes.InspeksiPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class InspeksiActionToggleLoading implements Action {
	readonly type = InspeksiActionTypes.InspeksiActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type InspeksiActions = InspeksiCreated
	| InspeksiUpdated
	| InspeksiDeleted
	| InspeksiOnServerCreated
	| InspeksiPageLoaded
	| InspeksiPageCancelled
	| InspeksiPageToggleLoading
	| InspeksiPageRequested
	| InspeksiActionToggleLoading;
