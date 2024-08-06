// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { CategoryModel } from './category.model';
import { QueryCategoryModel } from './querycategory.model';
// Models

export enum CategoryActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	CategoryOnServerCreated = '[Edit Category Component] Category On Server Created',
	CategoryCreated = '[Edit Category Dialog] Category Created',
	CategoryUpdated = '[Edit Category Dialog] Category Updated',
	CategoryDeleted = '[Category List Page] Category Deleted',
	CategoryPageRequested = '[Category List Page] Category Page Requested',
	CategoryPageLoaded = '[Category API] Category Page Loaded',
	CategoryPageCancelled = '[Category API] Category Page Cancelled',
	CategoryPageToggleLoading = '[Category] Category Page Toggle Loading',
	CategoryActionToggleLoading = '[Category] Category Action Toggle Loading'
}
export class CategoryOnServerCreated implements Action {
	readonly type = CategoryActionTypes.CategoryOnServerCreated;
	constructor(public payload: { category: CategoryModel }) { }
}

export class CategoryCreated implements Action {
	readonly type = CategoryActionTypes.CategoryCreated;
	constructor(public payload: { category: CategoryModel }) { }
}


export class CategoryUpdated implements Action {
	readonly type = CategoryActionTypes.CategoryUpdated;
	constructor(public payload: {
		partialCategory: Update<CategoryModel>,
		category: CategoryModel
	}) { }
}

export class CategoryDeleted implements Action {
	readonly type = CategoryActionTypes.CategoryDeleted;

	constructor(public payload: { id: string }) {}
}

export class CategoryPageRequested implements Action {
	readonly type = CategoryActionTypes.CategoryPageRequested;
	constructor(public payload: { page: QueryCategoryModel }) { }
}

export class CategoryPageLoaded implements Action {
	readonly type = CategoryActionTypes.CategoryPageLoaded;
	constructor(public payload: { category: CategoryModel[], totalCount: number, page: QueryCategoryModel  }) { }
}


export class CategoryPageCancelled implements Action {
	readonly type = CategoryActionTypes.CategoryPageCancelled;
}

export class CategoryPageToggleLoading implements Action {
	readonly type = CategoryActionTypes.CategoryPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class CategoryActionToggleLoading implements Action {
	readonly type = CategoryActionTypes.CategoryActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type CategoryActions = CategoryCreated
	| CategoryUpdated
	| CategoryDeleted
	| CategoryOnServerCreated
	| CategoryPageLoaded
	| CategoryPageCancelled
	| CategoryPageToggleLoading
	| CategoryPageRequested
	| CategoryActionToggleLoading;
