// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { UnitTypeActions, UnitTypeActionTypes } from './unittype.action';
// CRUD
import { QueryParamsModel } from '../_base/crud/models/query-models/query-params.model';
// Models
import { UnitTypeModel } from './unittype.model';

// tslint:disable-next-line:no-empty-interface
export interface UnitTypeState extends EntityState<UnitTypeModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedUnitTypeId: string;
	lastQuery: QueryParamsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<UnitTypeModel> = createEntityAdapter<UnitTypeModel>(
	{ selectId: model => model._id, }
);

export const initialUnitTypeState: UnitTypeState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedUnitTypeId: undefined,
	showInitWaitingMessage: true
});

export function unittypeReducer(state = initialUnitTypeState, action: UnitTypeActions): UnitTypeState {
	switch  (action.type) {
		case UnitTypeActionTypes.UnitTypePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedUnitTypeId: undefined
		};
		case UnitTypeActionTypes.UnitTypeActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case UnitTypeActionTypes.UnitTypeOnServerCreated: return {
			...state
		};
		case UnitTypeActionTypes.UnitTypeCreated: return adapter.addOne(action.payload.unittype, {
			...state, lastCreatedBlockId: action.payload.unittype._id
		});
		case UnitTypeActionTypes.UnitTypeUpdated: return adapter.updateOne(action.payload.partialUnitType, state);
		case UnitTypeActionTypes.UnitTypeDeleted: return adapter.removeOne(action.payload.id, state);
		case UnitTypeActionTypes.UnitTypePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case UnitTypeActionTypes.UnitTypePageLoaded: {
			return adapter.addMany(action.payload.unittype, {
				...initialUnitTypeState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getUnitTypeState = createFeatureSelector<UnitTypeState>('unittype');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
