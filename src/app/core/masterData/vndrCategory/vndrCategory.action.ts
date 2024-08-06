import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { VndrCategoryModel } from './vndrCategory.model';
import { QueryVndrCategoryModel } from './queryvndrCategory.model';

export enum VndrCategoryActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	VndrCategoryOnServerCreated = '[Edit VndrCategory Component] VndrCategory On Server Created',
	VndrCategoryCreated = '[Edit VndrCategory Dialog] VndrCategory Created',
	VndrCategoryUpdated = '[Edit VndrCategory Dialog] VndrCategory Updated',
	VndrCategoryDeleted = '[VndrCategory List Page] VndrCategory Deleted',
	VndrCategoryPageRequested = '[VndrCategory List Page] VndrCategory Page Requested',
	VndrCategoryPageLoaded = '[VndrCategory API] VndrCategory Page Loaded',
	VndrCategoryPageCancelled = '[VndrCategory API] VndrCategory Page Cancelled',
	VndrCategoryPageToggleLoading = '[VndrCategory] VndrCategory Page Toggle Loading',
	VndrCategoryActionToggleLoading = '[VndrCategory] VndrCategory Action Toggle Loading'
}
export class VndrCategoryOnServerCreated implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryOnServerCreated;
	constructor(public payload: { vndrCategory: VndrCategoryModel }) { }
}
export class VndrCategoryCreated implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryCreated;
	constructor(public payload: { vndrCategory: VndrCategoryModel }) { }
}
export class VndrCategoryUpdated implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryUpdated;
	constructor(public payload: {
		partialVndrCategory: Update<VndrCategoryModel>,
		vndrCategory: VndrCategoryModel
	}) { }
}
export class VndrCategoryDeleted implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryDeleted;

	constructor(public payload: { id: string }) {}
}
export class VndrCategoryPageRequested implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryPageRequested;
	constructor(public payload: { page: QueryVndrCategoryModel }) { }
}
export class VndrCategoryPageLoaded implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryPageLoaded;
	constructor(public payload: { vndrCategory: VndrCategoryModel[], totalCount: number, page: QueryVndrCategoryModel  }) { }
}
export class VndrCategoryPageCancelled implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryPageCancelled;
}
export class VndrCategoryPageToggleLoading implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class VndrCategoryActionToggleLoading implements Action {
	readonly type = VndrCategoryActionTypes.VndrCategoryActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type VndrCategoryActions = VndrCategoryCreated
	| VndrCategoryUpdated
	| VndrCategoryDeleted
	| VndrCategoryOnServerCreated
	| VndrCategoryPageLoaded
	| VndrCategoryPageCancelled
	| VndrCategoryPageToggleLoading
	| VndrCategoryPageRequested
	| VndrCategoryActionToggleLoading;
