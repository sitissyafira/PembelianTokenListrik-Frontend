import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { VendorModel } from './vendor.model';
import { QueryVendorModel } from './queryvendor.model';

export enum VendorActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	VendorOnServerCreated = '[Edit Vendor Component] Vendor On Server Created',
	VendorCreated = '[Edit Vendor Dialog] Vendor Created',
	VendorUpdated = '[Edit Vendor Dialog] Vendor Updated',
	VendorDeleted = '[Vendor List Page] Vendor Deleted',
	VendorPageRequested = '[Vendor List Page] Vendor Page Requested',
	VendorPageLoaded = '[Vendor API] Vendor Page Loaded',
	VendorPageCancelled = '[Vendor API] Vendor Page Cancelled',
	VendorPageToggleLoading = '[Vendor] Vendor Page Toggle Loading',
	VendorActionToggleLoading = '[Vendor] Vendor Action Toggle Loading'
}
export class VendorOnServerCreated implements Action {
	readonly type = VendorActionTypes.VendorOnServerCreated;
	constructor(public payload: { vendor: VendorModel }) { }
}
export class VendorCreated implements Action {
	readonly type = VendorActionTypes.VendorCreated;
	constructor(public payload: { vendor: VendorModel }) { }
}
export class VendorUpdated implements Action {
	readonly type = VendorActionTypes.VendorUpdated;
	constructor(public payload: {
		partialVendor: Update<VendorModel>,
		vendor: VendorModel
	}) { }
}
export class VendorDeleted implements Action {
	readonly type = VendorActionTypes.VendorDeleted;

	constructor(public payload: { id: string }) {}
}
export class VendorPageRequested implements Action {
	readonly type = VendorActionTypes.VendorPageRequested;
	constructor(public payload: { page: QueryVendorModel }) { }
}
export class VendorPageLoaded implements Action {
	readonly type = VendorActionTypes.VendorPageLoaded;
	constructor(public payload: { vendor: VendorModel[], totalCount: number, page: QueryVendorModel  }) { }
}
export class VendorPageCancelled implements Action {
	readonly type = VendorActionTypes.VendorPageCancelled;
}
export class VendorPageToggleLoading implements Action {
	readonly type = VendorActionTypes.VendorPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class VendorActionToggleLoading implements Action {
	readonly type = VendorActionTypes.VendorActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type VendorActions = VendorCreated
	| VendorUpdated
	| VendorDeleted
	| VendorOnServerCreated
	| VendorPageLoaded
	| VendorPageCancelled
	| VendorPageToggleLoading
	| VendorPageRequested
	| VendorActionToggleLoading;
