// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { CustomerModel } from './customer.model';
import { QueryCustomerModel } from './querycustomer.model';
// Models

export enum CustomerActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	CustomerOnServerCreated = '[Edit Customer Component] Customer On Server Created',
	CustomerCreated = '[Edit Customer Dialog] Customer Created',
	CustomerUpdated = '[Edit Customer Dialog] Customer Updated',
	CustomerDeleted = '[Customer List Page] Customer Deleted',
	CustomerPageRequested = '[Customer List Page] Customer Page Requested',
	CustomerPageLoaded = '[Customer API] Customer Page Loaded',
	CustomerPageCancelled = '[Customer API] Customer Page Cancelled',
	CustomerPageToggleLoading = '[Customer] Customer Page Toggle Loading',
	CustomerActionToggleLoading = '[Customer] Customer Action Toggle Loading'
}
export class CustomerOnServerCreated implements Action {
	readonly type = CustomerActionTypes.CustomerOnServerCreated;
	constructor(public payload: { customer: CustomerModel }) { }
}

export class CustomerCreated implements Action {
	readonly type = CustomerActionTypes.CustomerCreated;
	constructor(public payload: { customer: CustomerModel }) { }
}


export class CustomerUpdated implements Action {
	readonly type = CustomerActionTypes.CustomerUpdated;
	constructor(public payload: {
		partialCustomer: Update<CustomerModel>,
		customer: CustomerModel
	}) { }
}

export class CustomerDeleted implements Action {
	readonly type = CustomerActionTypes.CustomerDeleted;

	constructor(public payload: { id: string }) {}
}

export class CustomerPageRequested implements Action {
	readonly type = CustomerActionTypes.CustomerPageRequested;
	constructor(public payload: { page: QueryCustomerModel }) { }
}

export class CustomerPageLoaded implements Action {
	readonly type = CustomerActionTypes.CustomerPageLoaded;
	constructor(public payload: { customer: CustomerModel[], totalCount: number, page: QueryCustomerModel  }) { }
}


export class CustomerPageCancelled implements Action {
	readonly type = CustomerActionTypes.CustomerPageCancelled;
}

export class CustomerPageToggleLoading implements Action {
	readonly type = CustomerActionTypes.CustomerPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class CustomerActionToggleLoading implements Action {
	readonly type = CustomerActionTypes.CustomerActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type CustomerActions = CustomerCreated
	| CustomerUpdated
	| CustomerDeleted
	| CustomerOnServerCreated
	| CustomerPageLoaded
	| CustomerPageCancelled
	| CustomerPageToggleLoading
	| CustomerPageRequested
	| CustomerActionToggleLoading;
