import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { TopUpModel } from './topup.model';
// Models
import { QueryTopUpModel } from './querytopup.model';


export enum TopUpActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TopUpOnServerCreated = '[Edit TopUp Component] TopUp On Server Created',
	TopUpCreated = '[Edit TopUp Dialog] TopUp Created',
	TopUpUpdated = '[Edit TopUp Dialog] TopUp Updated',
	TopUpDeleted = '[TopUp List Page] TopUp Deleted',
	TopUpPageRequested = '[TopUp List Page] TopUp Page Requested',
	TopUpPageRequestedLog = '[TopUpLog ListLog Page] TopUpLog Page Requested',
	TopUpPageLoaded = '[TopUp API] TopUp Page Loaded',
	TopUpPageCancelled = '[TopUp API] TopUp Page Cancelled',
	TopUpPageToggleLoading = '[TopUp] TopUp Page Toggle Loading',
	TopUpActionToggleLoading = '[TopUp] TopUp Action Toggle Loading'
}

export class TopUpOnServerCreated implements Action {
	readonly type = TopUpActionTypes.TopUpOnServerCreated;
	constructor(public payload: { topup: TopUpModel }) { }
}

export class TopUpCreated implements Action {
	readonly type = TopUpActionTypes.TopUpCreated;
	constructor(public payload: { topup: TopUpModel }) { }
}

export class TopUpUpdated implements Action {
	readonly type = TopUpActionTypes.TopUpUpdated;
	constructor(public payload: {
		partialTopUp: Update<TopUpModel>,
		topup: TopUpModel
	}) { }
}

export class TopUpDeleted implements Action {
	readonly type = TopUpActionTypes.TopUpDeleted;
	constructor(public payload: { id: string }) { }
}

export class TopUpPageRequested implements Action {
	readonly type = TopUpActionTypes.TopUpPageRequested;
	constructor(public payload: { page: QueryTopUpModel }) { }
}

export class TopUpPageRequestedLog implements Action {
	readonly type = TopUpActionTypes.TopUpPageRequestedLog;
	constructor(public payload: { page: QueryTopUpModel }) { }
}

export class TopUpPageLoaded implements Action {
	readonly type = TopUpActionTypes.TopUpPageLoaded;
	constructor(public payload: { topup: TopUpModel[], totalCount: number, page: QueryTopUpModel }) { }
}


export class TopUpPageCancelled implements Action {
	readonly type = TopUpActionTypes.TopUpPageCancelled;
}

export class TopUpPageToggleLoading implements Action {
	readonly type = TopUpActionTypes.TopUpPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class TopUpActionToggleLoading implements Action {
	readonly type = TopUpActionTypes.TopUpActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type TopUpActions = TopUpCreated
	| TopUpUpdated
	| TopUpDeleted
	| TopUpOnServerCreated
	| TopUpPageLoaded
	| TopUpPageCancelled
	| TopUpPageToggleLoading
	| TopUpPageRequested
	| TopUpActionToggleLoading
