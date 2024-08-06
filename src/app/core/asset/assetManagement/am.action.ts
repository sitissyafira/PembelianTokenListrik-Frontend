// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { AmModel } from './am.model';
import { QueryAmModel } from './queryam.model';
// Models

export enum AmActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	AmOnServerCreated = '[Edit Am Component] Am On Server Created',
	AmCreated = '[Edit Am Dialog] Am Created',
	AmUpdated = '[Edit Am Dialog] Am Updated',
	AmDeleted = '[Am List Page] Am Deleted',
	AmPageRequested = '[Am List Page] Am Page Requested',
	AmPageLoaded = '[Am API] Am Page Loaded',
	AmPageCancelled = '[Am API] Am Page Cancelled',
	AmPageToggleLoading = '[Am] Am Page Toggle Loading',
	AmActionToggleLoading = '[Am] Am Action Toggle Loading'
}
export class AmOnServerCreated implements Action {
	readonly type = AmActionTypes.AmOnServerCreated;
	constructor(public payload: { am: AmModel }) { }
}

export class AmCreated implements Action {
	readonly type = AmActionTypes.AmCreated;
	constructor(public payload: { am: AmModel }) { }
}


export class AmUpdated implements Action {
	readonly type = AmActionTypes.AmUpdated;
	constructor(public payload: {
		partialAm: Update<AmModel>,
		am: AmModel
	}) { }
}

export class AmDeleted implements Action {
	readonly type = AmActionTypes.AmDeleted;

	constructor(public payload: { id: string }) {}
}

export class AmPageRequested implements Action {
	readonly type = AmActionTypes.AmPageRequested;
	constructor(public payload: { page: QueryAmModel }) { }
}

export class AmPageLoaded implements Action {
	readonly type = AmActionTypes.AmPageLoaded;
	constructor(public payload: { am: AmModel[], totalCount: number, page: QueryAmModel  }) { }
}


export class AmPageCancelled implements Action {
	readonly type = AmActionTypes.AmPageCancelled;
}

export class AmPageToggleLoading implements Action {
	readonly type = AmActionTypes.AmPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class AmActionToggleLoading implements Action {
	readonly type = AmActionTypes.AmActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type AmActions = AmCreated
	| AmUpdated
	| AmDeleted
	| AmOnServerCreated
	| AmPageLoaded
	| AmPageCancelled
	| AmPageToggleLoading
	| AmPageRequested
	| AmActionToggleLoading;
