// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { TicketModel } from './ticket.model';
import { QueryTicketModel } from './queryticket.model';
// Models

export enum TicketActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	TicketOnServerCreated = '[Edit Ticket Component] Ticket On Server Created',
	TicketCreated = '[Edit Ticket Dialog] Ticket Created',
	TicketUpdated = '[Edit Ticket Dialog] Ticket Updated',
	TicketDeleted = '[Ticket List Page] Ticket Deleted',
	RatingDeleted = '[Ticket List Page] Rating Deleted',

	TicketPageRequested = '[Ticket List Page] Ticket Page Requested',
	TicketPageLoaded = '[Ticket API] Ticket Page Loaded',

	TicketPageWaitSurvey = '[Ticket List Page] Ticket Page Requested for WaitSurvey',
	TicketPageSchSurvey = '[Ticket List Page] Ticket Page Requested for SchSurvey',
	TicketPageReject = '[Ticket List Page] Ticket Page Requested for Reject',
	TicketPageSurveyDone = '[Ticket List Page] Ticket Page Requested for SurveyDone',

	TicketPageWfs = '[Ticket List Page] Ticket Page Requested for WFS',
	TicketPageWfc = '[Ticket List Page] Ticket Page Requested for WFC',
	TicketPageOpen = '[Ticket List Open] Ticket Page Requested for Open',
	TicketPageScheduled = '[Ticket List Page] Ticket Page Requested for Scheduled',
	TicketPageRescheduled = '[Ticket List Page] Ticket Page Requested for Rescheduled',
	TicketPageDone = '[Ticket List Page] Ticket Page Requested for Done',
	TicketPageRating = '[Ticket List Rating Page] Ticket Rating Page',
	TicketPageForSPV = '[Ticket  List for spv]',

	TicketPageCancelled = '[Ticket API] Ticket Page Cancelled',
	TicketPageToggleLoading = '[Ticket] Ticket Page Toggle Loading',
	TicketActionToggleLoading = '[Ticket] Ticket Action Toggle Loading'
}

//Ticket List 
export class TicketOnServerCreated implements Action {
	readonly type = TicketActionTypes.TicketOnServerCreated;
	constructor(public payload: { ticket: TicketModel }) { }
}

export class TicketCreated implements Action {
	readonly type = TicketActionTypes.TicketCreated;
	constructor(public payload: { ticket: TicketModel }) { }
}


export class TicketUpdated implements Action {
	readonly type = TicketActionTypes.TicketUpdated;
	constructor(public payload: {
		partialTicket: Update<TicketModel>,
		ticket: TicketModel
	}) { }
}

export class TicketDeleted implements Action {
	readonly type = TicketActionTypes.TicketDeleted;

	constructor(public payload: { id: string }) { }
}
export class RatingDeleted implements Action {
	readonly type = TicketActionTypes.RatingDeleted;

	constructor(public payload: { id: string }) { }
}

export class TicketPageRequested implements Action {
	readonly type = TicketActionTypes.TicketPageRequested;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageLoaded implements Action {
	readonly type = TicketActionTypes.TicketPageLoaded;
	constructor(public payload: { ticket: TicketModel[], totalCount: number, page: QueryTicketModel }) { }
}



export class TicketPageCancelled implements Action {
	readonly type = TicketActionTypes.TicketPageCancelled;
}

export class TicketPageToggleLoading implements Action {
	readonly type = TicketActionTypes.TicketPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class TicketActionToggleLoading implements Action {
	readonly type = TicketActionTypes.TicketActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}



export class TicketPageRequestedOpen implements Action {
	readonly type = TicketActionTypes.TicketPageOpen;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedWfs implements Action {
	readonly type = TicketActionTypes.TicketPageWfs;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedWfc implements Action {
	readonly type = TicketActionTypes.TicketPageWfc;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedScheduled implements Action {
	readonly type = TicketActionTypes.TicketPageScheduled;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedRescheduled implements Action {
	readonly type = TicketActionTypes.TicketPageRescheduled;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRating implements Action {
	readonly type = TicketActionTypes.TicketPageRating;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedDone implements Action {
	readonly type = TicketActionTypes.TicketPageDone;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedWaitSurvey implements Action {
	readonly type = TicketActionTypes.TicketPageWaitSurvey;
	constructor(public payload: { page: QueryTicketModel }) { }
}
export class TicketPageRequestedSchSurvey implements Action {
	readonly type = TicketActionTypes.TicketPageSchSurvey;
	constructor(public payload: { page: QueryTicketModel }) { }
}
export class TicketPageRequestedReject implements Action {
	readonly type = TicketActionTypes.TicketPageReject;
	constructor(public payload: { page: QueryTicketModel }) { }
}
export class TicketPageRequestedSurveyDone implements Action {
	readonly type = TicketActionTypes.TicketPageSurveyDone;
	constructor(public payload: { page: QueryTicketModel }) { }
}

export class TicketPageRequestedSPV implements Action {
	readonly type = TicketActionTypes.TicketPageForSPV;
	constructor(public payload: { page: QueryTicketModel }) { }
}




export type TicketActions = TicketCreated
	| TicketUpdated
	| TicketDeleted
	| RatingDeleted
	| TicketOnServerCreated
	| TicketPageLoaded
	| TicketPageCancelled
	| TicketPageToggleLoading
	| TicketPageRequested
	| TicketActionToggleLoading

	| TicketPageRequestedWfs
	| TicketPageRequestedWfc
	| TicketPageRequestedScheduled
	| TicketPageRequestedRescheduled
	| TicketPageRequestedDone
	| TicketPageRating
	| TicketPageRequestedSPV
	| TicketPageRequestedOpen
	| TicketPageRequestedWaitSurvey
	| TicketPageRequestedSchSurvey
	| TicketPageRequestedReject
	| TicketPageRequestedSurveyDone

