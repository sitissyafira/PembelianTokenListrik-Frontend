// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { PublicTicketModel } from './publicticket.model';
import { QueryPublicTicketModel } from './querypublicticket.model';
// Models

export enum PublicTicketActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PublicTicketOnServerCreated = '[Edit PublicTicket Component] PublicTicket On Server Created',
	PublicTicketCreated = '[Edit PublicTicket Dialog] PublicTicket Created',
	PublicTicketUpdated = '[Edit PublicTicket Dialog] PublicTicket Updated',
	PublicTicketDeleted = '[PublicTicket List Page] PublicTicket Deleted',
	RatingDeleted = '[PublicTicket List Page] Rating Deleted',

	PublicTicketPageRequested = '[PublicTicket List Page] PublicTicket Page Requested',
	PublicTicketPageLoaded = '[PublicTicket API] PublicTicket Page Loaded',

	PublicTicketPageWaitSurvey = '[PublicTicket List Page] PublicTicket Page Requested for WaitSurvey',
	PublicTicketPageSchSurvey = '[PublicTicket List Page] PublicTicket Page Requested for SchSurvey',
	PublicTicketPageReject = '[PublicTicket List Page] PublicTicket Page Requested for Reject',
	PublicTicketPageSurveyDone = '[PublicTicket List Page] PublicTicket Page Requested for SurveyDone',

	PublicTicketPageWfs = '[PublicTicket List Page] PublicTicket Page Requested for WFS',
	PublicTicketPageWfc = '[PublicTicket List Page] PublicTicket Page Requested for WFC',
	PublicTicketPageOpen = '[PublicTicket List Open] PublicTicket Page Requested for Open',
	PublicTicketPageScheduled = '[PublicTicket List Page] PublicTicket Page Requested for Scheduled',
	PublicTicketPageRescheduled = '[PublicTicket List Page] PublicTicket Page Requested for Rescheduled',
	PublicTicketPageDone = '[PublicTicket List Page] PublicTicket Page Requested for Done',
	PublicTicketPageRating = '[PublicTicket List Rating Page] PublicTicket Rating Page',
	PublicTicketPageForSPV = '[PublicTicket  List for spv]',

	PublicTicketPageCancelled = '[PublicTicket API] PublicTicket Page Cancelled',
	PublicTicketPageToggleLoading = '[PublicTicket] PublicTicket Page Toggle Loading',
	PublicTicketActionToggleLoading = '[PublicTicket] PublicTicket Action Toggle Loading'
}

//PublicTicket List 
export class PublicTicketOnServerCreated implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketOnServerCreated;
	constructor(public payload: { publicTicket: PublicTicketModel }) { }
}

export class PublicTicketCreated implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketCreated;
	constructor(public payload: { publicTicket: PublicTicketModel }) { }
}


export class PublicTicketUpdated implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketUpdated;
	constructor(public payload: {
		partialPublicTicket: Update<PublicTicketModel>,
		publicTicket: PublicTicketModel
	}) { }
}

export class PublicTicketDeleted implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketDeleted;

	constructor(public payload: { id: string }) { }
}
export class RatingDeleted implements Action {
	readonly type = PublicTicketActionTypes.RatingDeleted;

	constructor(public payload: { id: string }) { }
}

export class PublicTicketPageRequested implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageRequested;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageLoaded implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageLoaded;
	constructor(public payload: { publicTicket: PublicTicketModel[], totalCount: number, page: QueryPublicTicketModel }) { }
}



export class PublicTicketPageCancelled implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageCancelled;
}

export class PublicTicketPageToggleLoading implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class PublicTicketActionToggleLoading implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}



export class PublicTicketPageRequestedOpen implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageOpen;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedWfs implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageWfs;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedWfc implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageWfc;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedScheduled implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageScheduled;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedRescheduled implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageRescheduled;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRating implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageRating;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedDone implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageDone;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedWaitSurvey implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageWaitSurvey;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}
export class PublicTicketPageRequestedSchSurvey implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageSchSurvey;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}
export class PublicTicketPageRequestedReject implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageReject;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}
export class PublicTicketPageRequestedSurveyDone implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageSurveyDone;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}

export class PublicTicketPageRequestedSPV implements Action {
	readonly type = PublicTicketActionTypes.PublicTicketPageForSPV;
	constructor(public payload: { page: QueryPublicTicketModel }) { }
}




export type PublicTicketActions = PublicTicketCreated
	| PublicTicketUpdated
	| PublicTicketDeleted
	| RatingDeleted
	| PublicTicketOnServerCreated
	| PublicTicketPageLoaded
	| PublicTicketPageCancelled
	| PublicTicketPageToggleLoading
	| PublicTicketPageRequested
	| PublicTicketActionToggleLoading

	| PublicTicketPageRequestedWfs
	| PublicTicketPageRequestedWfc
	| PublicTicketPageRequestedScheduled
	| PublicTicketPageRequestedRescheduled
	| PublicTicketPageRequestedDone
	| PublicTicketPageRating
	| PublicTicketPageRequestedSPV
	| PublicTicketPageRequestedOpen
	| PublicTicketPageRequestedWaitSurvey
	| PublicTicketPageRequestedSchSurvey
	| PublicTicketPageRequestedReject
	| PublicTicketPageRequestedSurveyDone

