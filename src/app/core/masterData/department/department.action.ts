import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { DepartmentModel } from './department.model';
import { QueryDepartmentModel } from './querydepartment.model';

export enum DepartmentActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	DepartmentOnServerCreated = '[Edit Department Component] Department On Server Created',
	DepartmentCreated = '[Edit Department Dialog] Department Created',
	DepartmentUpdated = '[Edit Department Dialog] Department Updated',
	DepartmentDeleted = '[Department List Page] Department Deleted',
	DepartmentPageRequested = '[Department List Page] Department Page Requested',
	DepartmentPageLoaded = '[Department API] Department Page Loaded',
	DepartmentPageCancelled = '[Department API] Department Page Cancelled',
	DepartmentPageToggleLoading = '[Department] Department Page Toggle Loading',
	DepartmentActionToggleLoading = '[Department] Department Action Toggle Loading'
}
export class DepartmentOnServerCreated implements Action {
	readonly type = DepartmentActionTypes.DepartmentOnServerCreated;
	constructor(public payload: { department: DepartmentModel }) { }
}
export class DepartmentCreated implements Action {
	readonly type = DepartmentActionTypes.DepartmentCreated;
	constructor(public payload: { department: DepartmentModel }) { }
}
export class DepartmentUpdated implements Action {
	readonly type = DepartmentActionTypes.DepartmentUpdated;
	constructor(public payload: {
		partialDepartment: Update<DepartmentModel>,
		department: DepartmentModel
	}) { }
}
export class DepartmentDeleted implements Action {
	readonly type = DepartmentActionTypes.DepartmentDeleted;

	constructor(public payload: { id: string }) {}
}
export class DepartmentPageRequested implements Action {
	readonly type = DepartmentActionTypes.DepartmentPageRequested;
	constructor(public payload: { page: QueryDepartmentModel }) { }
}
export class DepartmentPageLoaded implements Action {
	readonly type = DepartmentActionTypes.DepartmentPageLoaded;
	constructor(public payload: { department: DepartmentModel[], totalCount: number, page: QueryDepartmentModel  }) { }
}
export class DepartmentPageCancelled implements Action {
	readonly type = DepartmentActionTypes.DepartmentPageCancelled;
}
export class DepartmentPageToggleLoading implements Action {
	readonly type = DepartmentActionTypes.DepartmentPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class DepartmentActionToggleLoading implements Action {
	readonly type = DepartmentActionTypes.DepartmentActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type DepartmentActions = DepartmentCreated
	| DepartmentUpdated
	| DepartmentDeleted
	| DepartmentOnServerCreated
	| DepartmentPageLoaded
	| DepartmentPageCancelled
	| DepartmentPageToggleLoading
	| DepartmentPageRequested
	| DepartmentActionToggleLoading;
