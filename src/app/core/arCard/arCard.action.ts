// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ArCardModel } from './arCard.model';
// Models
import { QueryArCardModel } from './queryarCard.model';

export enum ArCardActionTypes {
	AllUsersRequested = '[ArCard Module] All ArCard Requested',
	AllUsersLoaded = '[ArCard API] All ArCard Loaded',
	ArCardOnServerCreated = '[Edit ArCard Component] ArCard On Server Created',
	ArCardCreated = '[Edit ArCard Dialog] ArCard Created',
	ArCardUpdated = '[Edit ArCard Dialog] ArCard Updated',
	ArCardDeleted = '[ArCard List Page] ArCard Deleted',
	ArCardPageRequested = '[ArCard List Page] ArCard Page Requested',
	ArCardPageLoaded = '[ArCard API] ArCard Page Loaded',
	ArCardPageCancelled = '[ArCard API] ArCard Page Cancelled',
	ArCardPageToggleLoading = '[ArCard] ArCard Page Toggle Loading',
	ArCardActionToggleLoading = '[ArCard] ArCard Action Toggle Loading'
}
export class ArCardOnServerCreated implements Action {
	readonly type = ArCardActionTypes.ArCardOnServerCreated;
	constructor(public payload: { arCard: ArCardModel }) { }
}

export class ArCardCreated implements Action {
	readonly type = ArCardActionTypes.ArCardCreated;
	constructor(public payload: { arCard: ArCardModel }) { }
}


export class ArCardUpdated implements Action {
	readonly type = ArCardActionTypes.ArCardUpdated;
	constructor(public payload: {
		partialArCard: Update<ArCardModel>,
		arCard: ArCardModel
	}) { }
}

export class ArCardDeleted implements Action {
	readonly type = ArCardActionTypes.ArCardDeleted;

	constructor(public payload: { id: string }) { }
}

export class ArCardPageRequested implements Action {
	readonly type = ArCardActionTypes.ArCardPageRequested;
	constructor(public payload: { page: QueryArCardModel }) { }
}

export class ArCardPageLoaded implements Action {
	readonly type = ArCardActionTypes.ArCardPageLoaded;
	constructor(public payload: { arCard: ArCardModel[], totalCount: number, page: QueryArCardModel }) { }
}


export class ArCardPageCancelled implements Action {
	readonly type = ArCardActionTypes.ArCardPageCancelled;
}

export class ArCardPageToggleLoading implements Action {
	readonly type = ArCardActionTypes.ArCardPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ArCardActionToggleLoading implements Action {
	readonly type = ArCardActionTypes.ArCardActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ArCardActions = ArCardCreated
	| ArCardUpdated
	| ArCardDeleted
	| ArCardOnServerCreated
	| ArCardPageLoaded
	| ArCardPageCancelled
	| ArCardPageToggleLoading
	| ArCardPageRequested
	| ArCardActionToggleLoading;
