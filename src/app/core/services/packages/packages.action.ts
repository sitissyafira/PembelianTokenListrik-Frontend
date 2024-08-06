// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PackagesModel } from './packages.model';
import { QueryPackagesModel } from './querypackages.model';
// Models

export enum PackagesActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PackagesOnServerCreated = '[Edit Packages Component] Packages On Server Created',
	PackagesCreated = '[Edit Packages Dialog] Packages Created',
	PackagesUpdated = '[Edit Packages Dialog] Packages Updated',
	PackagesDeleted = '[Packages List Page] Packages Deleted',
	PackagesPageRequested = '[Packages List Page] Packages Page Requested',
	PackagesPageLafRequested = '[Packages List Page Laf] Packages Page Laf Requested',
	PackagesPageLoaded = '[Packages API] Packages Page Loaded',
	PackagesPageCancelled = '[Packages API] Packages Page Cancelled',
	PackagesPageToggleLoading = '[Packages] Packages Page Toggle Loading',
	PackagesActionToggleLoading = '[Packages] Packages Action Toggle Loading'
}
export class PackagesOnServerCreated implements Action {
	readonly type = PackagesActionTypes.PackagesOnServerCreated;
	constructor(public payload: { packages: PackagesModel }) { }
}

export class PackagesCreated implements Action {
	readonly type = PackagesActionTypes.PackagesCreated;
	constructor(public payload: { packages: PackagesModel }) { }
}


export class PackagesDeleted implements Action {
	readonly type = PackagesActionTypes.PackagesDeleted;

	constructor(public payload: { id: string }) { }
}

export class PackagesUpdated implements Action {
	readonly type = PackagesActionTypes.PackagesUpdated;
	constructor(public payload: {
		partialPackages: Update<PackagesModel>,
		packages: PackagesModel
	}) { }
}



export class PackagesPageRequested implements Action {
	readonly type = PackagesActionTypes.PackagesPageRequested;
	constructor(public payload: { page: QueryPackagesModel }) { }
}

export class PackagesPageLafRequested implements Action {
	readonly type = PackagesActionTypes.PackagesPageLafRequested;
	constructor(public payload: { page: QueryPackagesModel }) { }
}

export class PackagesPageLoaded implements Action {
	readonly type = PackagesActionTypes.PackagesPageLoaded;
	constructor(public payload: { packages: PackagesModel[], totalCount: number, page: QueryPackagesModel }) { }
}


export class PackagesPageCancelled implements Action {
	readonly type = PackagesActionTypes.PackagesPageCancelled;
}

export class PackagesPageToggleLoading implements Action {
	readonly type = PackagesActionTypes.PackagesPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PackagesActionToggleLoading implements Action {
	readonly type = PackagesActionTypes.PackagesActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type PackagesActions = PackagesCreated
	| PackagesUpdated
	| PackagesDeleted
	| PackagesOnServerCreated
	| PackagesPageLoaded
	| PackagesPageCancelled
	| PackagesPageToggleLoading
	| PackagesPageRequested
	| PackagesActionToggleLoading;
