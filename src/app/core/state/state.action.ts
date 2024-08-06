// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ProvinceModel } from './province.model';
import { RegencyModel } from './regency.model';
import { DistrictModel } from './district.model';
import { VillageModel } from './village.model';
// Models
import {QueryParamsModel} from '../_base/crud/models/query-models/query-params.model';

export enum StateActionTypes {
	ProvinceRequested = '[Province Module] Province Requested',
	RegencyRequested = '[Regency Module] Regency Requested',
	DistrictRequested = '[District Module] Regency Requested',
	VillageRequested = '[Village Module] Village Requested',
	ProvinceLoaded = '[Province API] Province Loaded',
	RegencyLoaded = '[Regency API] Regency Loaded',
	DistrictLoaded = '[District API] Regency Loaded',
	VillageLoaded = '[Village API] Village Loaded',
}

export class ProvinceRequested implements Action{
	readonly type = StateActionTypes.ProvinceRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class RegencyRequested implements Action{
	readonly type = StateActionTypes.RegencyRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class DistrictRequested implements Action{
	readonly type = StateActionTypes.DistrictRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class VillageRequested implements Action{
	readonly type = StateActionTypes.VillageRequested;
	constructor(public payload: { page: QueryParamsModel }) { }
}

export class ProvinceLoaded implements Action{
	readonly type = StateActionTypes.ProvinceLoaded;
	constructor(public payload: { province: ProvinceModel[], totalCount: number, page: QueryParamsModel  }) { }
}
export class RegencyLoaded implements Action{
	readonly type = StateActionTypes.RegencyLoaded;
	constructor(public payload: { province: RegencyModel[], totalCount: number, page: QueryParamsModel  }) { }
}
export class DistrictLoaded implements Action{
	readonly type = StateActionTypes.DistrictLoaded;
	constructor(public payload: { province: DistrictModel[], totalCount: number, page: QueryParamsModel  }) { }
}
export class VillageLoaded implements Action{
	readonly type = StateActionTypes.VillageLoaded;
	constructor(public payload: { province: VillageModel[], totalCount: number, page: QueryParamsModel  }) { }
}
