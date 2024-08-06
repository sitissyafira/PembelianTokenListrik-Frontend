// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { VehicleTypeActions, VehicleTypeActionTypes } from './vehicletype.action';
// CRUD
import { QueryParamsModel } from '../../core/_base/crud/models/query-models/query-params.model';
// Models
import { VehicleTypeModel } from './vehicletype.model';

// tslint:disable-next-line:no-empty-interface
export interface VehicleTypeState extends EntityState<VehicleTypeModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedVehicleTypeId: string;
	lastQuery: QueryParamsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<VehicleTypeModel> = createEntityAdapter<VehicleTypeModel>(
	{ selectId: model => model._id, }
);

export const initialVehicleTypeState: VehicleTypeState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedVehicleTypeId: undefined,
	showInitWaitingMessage: true
});

export function vehicletypeReducer(state = initialVehicleTypeState, action: VehicleTypeActions): VehicleTypeState {
	switch  (action.type) {
		case VehicleTypeActionTypes.VehicleTypePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVehicleTypeId: undefined
		};
		case VehicleTypeActionTypes.VehicleTypeActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VehicleTypeActionTypes.VehicleTypeOnServerCreated: return {
			...state
		};
		case VehicleTypeActionTypes.VehicleTypeCreated: return adapter.addOne(action.payload.vehicletype, {
			...state, lastCreatedBlockId: action.payload.vehicletype._id
		});
		case VehicleTypeActionTypes.VehicleTypeUpdated: return adapter.updateOne(action.payload.partialVehicleType, state);
		case VehicleTypeActionTypes.VehicleTypeDeleted: return adapter.removeOne(action.payload.id, state);
		case VehicleTypeActionTypes.VehicleTypePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case VehicleTypeActionTypes.VehicleTypePageLoaded: {
			return adapter.addMany(action.payload.vehicletype, {
				...initialVehicleTypeState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getVehicleTypeState = createFeatureSelector<VehicleTypeState>('vehicletype');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
