// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { VehicleTypeModel } from './vehicletype.model';
// Models
import {QueryParamsModel} from '../../core/_base/crud/models/query-models/query-params.model';

export enum VehicleTypeActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	VehicleTypeOnServerCreated = '[Edit VehicleType Component] VehicleType On Server Created',
	VehicleTypeCreated = '[Edit VehicleType Dialog] VehicleType Created',
	VehicleTypeUpdated = '[Edit VehicleType Dialog] VehicleType Updated',
	VehicleTypeDeleted = '[VehicleType List Page] VehicleType Deleted',
	VehicleTypePageRequested = '[VehicleType List Page] VehicleType Page Requested',
	VehicleTypePageLoaded = '[VehicleType API] VehicleType Page Loaded',
	VehicleTypePageCancelled = '[VehicleType API] VehicleType Page Cancelled',
	VehicleTypePageToggleLoading = '[VehicleType] VehicleType Page Toggle Loading',
	VehicleTypeActionToggleLoading = '[VehicleType] VehicleType Action Toggle Loading'
}
export class VehicleTypeOnServerCreated implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypeOnServerCreated;
	constructor(public payload: { vehicletype: VehicleTypeModel }) { }
}

export class VehicleTypeCreated implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypeCreated;
	constructor(public payload: { vehicletype: VehicleTypeModel }) { }
}


export class VehicleTypeUpdated implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypeUpdated;
	constructor(public payload: {
		partialVehicleType: Update<VehicleTypeModel>,
		vehicletype: VehicleTypeModel
	}) { }
}

export class VehicleTypeDeleted implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypeDeleted;

	constructor(public payload: { id: string }) {}
}

export class VehicleTypePageRequested implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypePageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class VehicleTypePageLoaded implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypePageLoaded;
	constructor(public payload: { vehicletype: VehicleTypeModel[], totalCount: number, page: QueryParamsModel  }) { }
}

export class VehicleTypePageCancelled implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypePageCancelled;
}

export class VehicleTypePageToggleLoading implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class VehicleTypeActionToggleLoading implements Action {
	readonly type = VehicleTypeActionTypes.VehicleTypeActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type VehicleTypeActions = VehicleTypeCreated
	| VehicleTypeUpdated
	| VehicleTypeDeleted
	| VehicleTypeOnServerCreated
	| VehicleTypePageLoaded
	| VehicleTypePageCancelled
	| VehicleTypePageToggleLoading
	| VehicleTypePageRequested
	| VehicleTypeActionToggleLoading;
