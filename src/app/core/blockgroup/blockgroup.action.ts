// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { BlockgroupModel } from './blockgroup.model';
// Models
import { QueryParamsModel } from '../_base/crud';

export enum BlockGroupActionTypes {
	AllBlockGroupRequested = '[Block Group Module] All Block Group Requested',
	AllBlockGroupLoaded = '[Block Group API] All Block Group Loaded',
	BlockGroupOnServerCreated = '[Edit Block Group Component] Block Group On Server Created',
	BlockGroupCreated = '[Edit Block Group Dialog] Block Group Created',
	BlockGroupUpdated = '[Edit Block Group Dialog] Block Group Updated',
	BlockGroupDeleted = '[Block Group List Page] Block Group Deleted',
	BlockGroupPageRequested = '[Block Group List Page] Block Group Page Requested',
	BlockGroupPageLoaded = '[Block Group API] Block Group Page Loaded',
	BlockGroupPageCancelled = '[Block Group API] Block Group Page Cancelled',
	BlockGroupPageToggleLoading = '[Block Group] Block Group Page Toggle Loading',
	BlockGroupActionToggleLoading = '[Block Group] Block Group Action Toggle Loading'
}
export class BlockGroupOnServerCreated implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupOnServerCreated;
	constructor(public payload: { blockgroup: BlockgroupModel }) { }
}

export class BlockGroupRequested implements Action{
	readonly type = BlockGroupActionTypes.AllBlockGroupRequested;
	constructor(public payload: {page: QueryParamsModel}) { }
}

export class BlockGroupLoaded implements Action{
	readonly type = BlockGroupActionTypes.AllBlockGroupLoaded;
	constructor(public payload: {blockgroup: BlockgroupModel[]}) { }
}

export class BlockGroupCreated implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupCreated;
	constructor(public payload: { blockgroup: BlockgroupModel }) { }
}


export class BlockGroupUpdated implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupUpdated;
	constructor(public payload: {
		partialBlockgroup: Update<BlockgroupModel>,
		blockgroup: BlockgroupModel
	}) { }
}

export class BlockGroupDeleted implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupDeleted;

	constructor(public payload: { id: string }) {}
}

export class BlockGroupPageRequested implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupPageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class BlockGroupPageLoaded implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupPageLoaded;
	constructor(public payload: { blockgroup: BlockgroupModel[], totalCount: number, page: QueryParamsModel  }) { }
}


export class BlockGroupPageCancelled implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupPageCancelled;
}

export class BlockGroupPageToggleLoading implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class BlockGroupActionToggleLoading implements Action {
	readonly type = BlockGroupActionTypes.BlockGroupActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type BlockGroupActions = BlockGroupCreated
	| BlockGroupUpdated
	| BlockGroupRequested
	| BlockGroupLoaded
	| BlockGroupDeleted
	| BlockGroupOnServerCreated
	| BlockGroupPageLoaded
	| BlockGroupPageCancelled
	| BlockGroupPageToggleLoading
	| BlockGroupPageRequested
	| BlockGroupActionToggleLoading;
