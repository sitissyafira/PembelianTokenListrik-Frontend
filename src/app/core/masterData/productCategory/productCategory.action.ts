import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ProductCategoryModel } from './productCategory.model';
import { QueryProductCategoryModel } from './queryproductCategory.model';

export enum ProductCategoryActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ProductCategoryOnServerCreated = '[Edit ProductCategory Component] ProductCategory On Server Created',
	ProductCategoryCreated = '[Edit ProductCategory Dialog] ProductCategory Created',
	ProductCategoryUpdated = '[Edit ProductCategory Dialog] ProductCategory Updated',
	ProductCategoryDeleted = '[ProductCategory List Page] ProductCategory Deleted',
	ProductCategoryPageRequested = '[ProductCategory List Page] ProductCategory Page Requested',
	ProductCategoryPageLoaded = '[ProductCategory API] ProductCategory Page Loaded',
	ProductCategoryPageCancelled = '[ProductCategory API] ProductCategory Page Cancelled',
	ProductCategoryPageToggleLoading = '[ProductCategory] ProductCategory Page Toggle Loading',
	ProductCategoryActionToggleLoading = '[ProductCategory] ProductCategory Action Toggle Loading'
}
export class ProductCategoryOnServerCreated implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryOnServerCreated;
	constructor(public payload: { productCategory: ProductCategoryModel }) { }
}
export class ProductCategoryCreated implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryCreated;
	constructor(public payload: { productCategory: ProductCategoryModel }) { }
}
export class ProductCategoryUpdated implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryUpdated;
	constructor(public payload: {
		partialProductCategory: Update<ProductCategoryModel>,
		productCategory: ProductCategoryModel
	}) { }
}
export class ProductCategoryDeleted implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryDeleted;

	constructor(public payload: { id: string }) {}
}
export class ProductCategoryPageRequested implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryPageRequested;
	constructor(public payload: { page: QueryProductCategoryModel }) { }
}
export class ProductCategoryPageLoaded implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryPageLoaded;
	constructor(public payload: { productCategory: ProductCategoryModel[], totalCount: number, page: QueryProductCategoryModel  }) { }
}
export class ProductCategoryPageCancelled implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryPageCancelled;
}
export class ProductCategoryPageToggleLoading implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ProductCategoryActionToggleLoading implements Action {
	readonly type = ProductCategoryActionTypes.ProductCategoryActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ProductCategoryActions = ProductCategoryCreated
	| ProductCategoryUpdated
	| ProductCategoryDeleted
	| ProductCategoryOnServerCreated
	| ProductCategoryPageLoaded
	| ProductCategoryPageCancelled
	| ProductCategoryPageToggleLoading
	| ProductCategoryPageRequested
	| ProductCategoryActionToggleLoading;
