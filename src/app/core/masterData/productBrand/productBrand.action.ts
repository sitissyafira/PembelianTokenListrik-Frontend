import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ProductBrandModel } from './productBrand.model';
import { QueryProductBrandModel } from './queryproductBrand.model';

export enum ProductBrandActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ProductBrandOnServerCreated = '[Edit ProductBrand Component] ProductBrand On Server Created',
	ProductBrandCreated = '[Edit ProductBrand Dialog] ProductBrand Created',
	ProductBrandUpdated = '[Edit ProductBrand Dialog] ProductBrand Updated',
	ProductBrandDeleted = '[ProductBrand List Page] ProductBrand Deleted',
	ProductBrandPageRequested = '[ProductBrand List Page] ProductBrand Page Requested',
	ProductBrandPageLoaded = '[ProductBrand API] ProductBrand Page Loaded',
	ProductBrandPageCancelled = '[ProductBrand API] ProductBrand Page Cancelled',
	ProductBrandPageToggleLoading = '[ProductBrand] ProductBrand Page Toggle Loading',
	ProductBrandActionToggleLoading = '[ProductBrand] ProductBrand Action Toggle Loading'
}
export class ProductBrandOnServerCreated implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandOnServerCreated;
	constructor(public payload: { productBrand: ProductBrandModel }) { }
}
export class ProductBrandCreated implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandCreated;
	constructor(public payload: { productBrand: ProductBrandModel }) { }
}
export class ProductBrandUpdated implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandUpdated;
	constructor(public payload: {
		partialProductBrand: Update<ProductBrandModel>,
		productBrand: ProductBrandModel
	}) { }
}
export class ProductBrandDeleted implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandDeleted;

	constructor(public payload: { id: string }) {}
}
export class ProductBrandPageRequested implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandPageRequested;
	constructor(public payload: { page: QueryProductBrandModel }) { }
}
export class ProductBrandPageLoaded implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandPageLoaded;
	constructor(public payload: { productBrand: ProductBrandModel[], totalCount: number, page: QueryProductBrandModel  }) { }
}
export class ProductBrandPageCancelled implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandPageCancelled;
}
export class ProductBrandPageToggleLoading implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class ProductBrandActionToggleLoading implements Action {
	readonly type = ProductBrandActionTypes.ProductBrandActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type ProductBrandActions = ProductBrandCreated
	| ProductBrandUpdated
	| ProductBrandDeleted
	| ProductBrandOnServerCreated
	| ProductBrandPageLoaded
	| ProductBrandPageCancelled
	| ProductBrandPageToggleLoading
	| ProductBrandPageRequested
	| ProductBrandActionToggleLoading;
