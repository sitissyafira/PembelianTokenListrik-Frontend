import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ApModel } from './ap.model';
import { QueryApModel } from './queryap.model';

export enum ApActionTypes {
	AllUsersRequested = '[Block Module] All Ap Requested',
	AllUsersLoaded = '[Block API] All Ap Loaded',
	ApOnServerCreated = '[Edit Ap Component] Ap On Server Created',
	ApCreated = '[Edit Ap Dialog] Ap Created',
	ApUpdated = '[Edit Ap Dialog] Ap Updated',
	ApDeleted = '[Ap List Page] Ap Deleted',
	ApPageRequested = '[Ap List Page] Ap Page Requested',
	ApPageLoaded = '[Ap API] Ap Page Loaded',
	ApPageCancelled = '[Ap API] Ap Page Cancelled',
	ApPageToggleLoading = '[Ap] Ap Page Toggle Loading',
	ApActionToggleLoading = '[Ap] Ap Action Toggle Loading'
}
export class ApOnServerCreated implements Action {
	readonly type = ApActionTypes.ApOnServerCreated;
	constructor(public payload: { ap: ApModel }) { }
}
export class ApCreated implements Action {
	readonly type = ApActionTypes.ApCreated;
	constructor(public payload: { ap: ApModel }) { }
}
export class ApUpdated implements Action {
	readonly type = ApActionTypes.ApUpdated;
	constructor(public payload: {
		partialAp: Update<ApModel>,
		ap: ApModel
	}) { }
}
export class ApDeleted implements Action {
	readonly type = ApActionTypes.ApDeleted;

	constructor(public payload: { id: string }) {}
}
export class ApPageRequested implements Action {
	readonly type = ApActionTypes.ApPageRequested;
	constructor(public payload: { page: QueryApModel }) { }
}
export class ApPageLoaded implements Action {
	readonly type = ApActionTypes.ApPageLoaded;
	constructor(public payload: { ap: ApModel[], totalCount: number, page: QueryApModel  }) { }
}
export class ApPageCancelled implements Action {
	readonly type = ApActionTypes.ApPageCancelled;
}
export class ApPageToggleLoading implements Action {
	readonly type = ApActionTypes.ApPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ApActionToggleLoading implements Action {
	readonly type = ApActionTypes.ApActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ApActions = ApCreated
	| ApUpdated
	| ApDeleted
	| ApOnServerCreated
	| ApPageLoaded
	| ApPageCancelled
	| ApPageToggleLoading
	| ApPageRequested
	| ApActionToggleLoading;
