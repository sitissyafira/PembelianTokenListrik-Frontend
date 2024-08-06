// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AdModel } from './ad.model';
import { QueryAdModel } from './queryad.model';
// Models

export enum AdActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AdOnServerCreated = '[Edit Ad Component] Ad On Server Created',
	AdCreated = '[Edit Ad Dialog] Ad Created',
	AdUpdated = '[Edit Ad Dialog] Ad Updated',
	AdDeleted = '[Ad List Page] Ad Deleted',
	AdPageRequested = '[Ad List Page] Ad Page Requested',
	AdPageLoaded = '[Ad API] Ad Page Loaded',
	AdPageCancelled = '[Ad API] Ad Page Cancelled',
	AdPageToggleLoading = '[Ad] Ad Page Toggle Loading',
	AdActionToggleLoading = '[Ad] Ad Action Toggle Loading'
}
export class AdOnServerCreated implements Action {
	readonly type = AdActionTypes.AdOnServerCreated;
	constructor(public payload: { ad: AdModel }) { }
}

export class AdCreated implements Action {
	readonly type = AdActionTypes.AdCreated;
	constructor(public payload: { ad: AdModel }) { }
}


export class AdUpdated implements Action {
	readonly type = AdActionTypes.AdUpdated;
	constructor(public payload: {
		partialAd: Update<AdModel>,
		ad: AdModel
	}) { }
}

export class AdDeleted implements Action {
	readonly type = AdActionTypes.AdDeleted;

	constructor(public payload: { id: string }) {}
}

export class AdPageRequested implements Action {
	readonly type = AdActionTypes.AdPageRequested;
	constructor(public payload: { page: QueryAdModel }) { }
}

export class AdPageLoaded implements Action {
	readonly type = AdActionTypes.AdPageLoaded;
	constructor(public payload: { ad: AdModel[], totalCount: number, page: QueryAdModel  }) { }
}


export class AdPageCancelled implements Action {
	readonly type = AdActionTypes.AdPageCancelled;
}

export class AdPageToggleLoading implements Action {
	readonly type = AdActionTypes.AdPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AdActionToggleLoading implements Action {
	readonly type = AdActionTypes.AdActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AdActions = AdCreated
	| AdUpdated
	| AdDeleted
	| AdOnServerCreated
	| AdPageLoaded
	| AdPageCancelled
	| AdPageToggleLoading
	| AdPageRequested
	| AdActionToggleLoading;
