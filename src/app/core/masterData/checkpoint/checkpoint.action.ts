import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { CheckpointModel } from './checkpoint.model';
import { QueryCheckpointModel } from './querycheckpoint.model';

export enum CheckpointActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	CheckpointOnServerCreated = '[Edit Checkpoint Component] Checkpoint On Server Created',
	CheckpointCreated = '[Edit Checkpoint Dialog] Checkpoint Created',
	CheckpointUpdated = '[Edit Checkpoint Dialog] Checkpoint Updated',
	CheckpointDeleted = '[Checkpoint List Page] Checkpoint Deleted',
	CheckpointPageRequested = '[Checkpoint List Page] Checkpoint Page Requested',
	CheckpointPageLoaded = '[Checkpoint API] Checkpoint Page Loaded',
	CheckpointPageCancelled = '[Checkpoint API] Checkpoint Page Cancelled',
	CheckpointPageToggleLoading = '[Checkpoint] Checkpoint Page Toggle Loading',
	CheckpointActionToggleLoading = '[Checkpoint] Checkpoint Action Toggle Loading'
}
export class CheckpointOnServerCreated implements Action {
	readonly type = CheckpointActionTypes.CheckpointOnServerCreated;
	constructor(public payload: { checkpoint: CheckpointModel }) { }
}
export class CheckpointCreated implements Action {
	readonly type = CheckpointActionTypes.CheckpointCreated;
	constructor(public payload: { checkpoint: CheckpointModel }) { }
}
export class CheckpointUpdated implements Action {
	readonly type = CheckpointActionTypes.CheckpointUpdated;
	constructor(public payload: {
		partialCheckpoint: Update<CheckpointModel>,
		checkpoint: CheckpointModel
	}) { }
}
export class CheckpointDeleted implements Action {
	readonly type = CheckpointActionTypes.CheckpointDeleted;

	constructor(public payload: { id: string }) {}
}
export class CheckpointPageRequested implements Action {
	readonly type = CheckpointActionTypes.CheckpointPageRequested;
	constructor(public payload: { page: QueryCheckpointModel }) { }
}
export class CheckpointPageLoaded implements Action {
	readonly type = CheckpointActionTypes.CheckpointPageLoaded;
	constructor(public payload: { checkpoint: CheckpointModel[], totalCount: number, page: QueryCheckpointModel  }) { }
}
export class CheckpointPageCancelled implements Action {
	readonly type = CheckpointActionTypes.CheckpointPageCancelled;
}
export class CheckpointPageToggleLoading implements Action {
	readonly type = CheckpointActionTypes.CheckpointPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class CheckpointActionToggleLoading implements Action {
	readonly type = CheckpointActionTypes.CheckpointActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type CheckpointActions = CheckpointCreated
	| CheckpointUpdated
	| CheckpointDeleted
	| CheckpointOnServerCreated
	| CheckpointPageLoaded
	| CheckpointPageCancelled
	| CheckpointPageToggleLoading
	| CheckpointPageRequested
	| CheckpointActionToggleLoading;
