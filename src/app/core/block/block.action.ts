// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { BlockModel } from './block.model';
// Models
import {QueryBlockModel} from './queryblock.model';

export enum BlockActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	BlockOnServerCreated = '[Edit Block Component] Block On Server Created',
	BlockCreated = '[Edit Block Dialog] Block Created',
	BlockUpdated = '[Edit Block Dialog] Block Updated',
	BlockDeleted = '[Block List Page] Block Deleted',
	BlockPageRequested = '[Block List Page] Block Page Requested',
	BlockPageLoaded = '[Block API] Block Page Loaded',
	BlockPageCancelled = '[Block API] Block Page Cancelled',
	BlockPageToggleLoading = '[Block] Block Page Toggle Loading',
	BlockActionToggleLoading = '[Block] Block Action Toggle Loading'
}
export class BlockOnServerCreated implements Action {
	readonly type = BlockActionTypes.BlockOnServerCreated;
	constructor(public payload: { block: BlockModel }) { }
}

export class BlockCreated implements Action {
	readonly type = BlockActionTypes.BlockCreated;
	constructor(public payload: { block: BlockModel }) { }
}


export class BlockUpdated implements Action {
	readonly type = BlockActionTypes.BlockUpdated;
	constructor(public payload: {
		partialBlock: Update<BlockModel>,
		block: BlockModel
	}) { }
}

export class BlockDeleted implements Action {
	readonly type = BlockActionTypes.BlockDeleted;

	constructor(public payload: { id: string }) {}
}

export class BlockPageRequested implements Action {
	readonly type = BlockActionTypes.BlockPageRequested;
	constructor(public payload: { page: QueryBlockModel }) { }
}

export class BlockPageLoaded implements Action {
	readonly type = BlockActionTypes.BlockPageLoaded;
	constructor(public payload: { block: BlockModel[], totalCount: number, page: QueryBlockModel  }) { }
}


export class BlockPageCancelled implements Action {
	readonly type = BlockActionTypes.BlockPageCancelled;
}

export class BlockPageToggleLoading implements Action {
	readonly type = BlockActionTypes.BlockPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BlockActionToggleLoading implements Action {
	readonly type = BlockActionTypes.BlockActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BlockActions = BlockCreated
	| BlockUpdated
	| BlockDeleted
	| BlockOnServerCreated
	| BlockPageLoaded
	| BlockPageCancelled
	| BlockPageToggleLoading
	| BlockPageRequested
	| BlockActionToggleLoading;
