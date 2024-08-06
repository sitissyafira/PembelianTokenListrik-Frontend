// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { UnitRateActions, UnitRateActionTypes } from './unitrate.action';
// CRUD
import { QueryParamsModel } from '../_base/crud/models/query-models/query-params.model';
// Models
import { UnitRateModel } from './unitrate.model';

// tslint:disable-next-line:no-empty-interface
export interface UnitRateState extends EntityState<UnitRateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedUnitRateId: string;
	lastQuery: QueryParamsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<UnitRateModel> = createEntityAdapter<UnitRateModel>(
	{ selectId: model => model._id, }
);

export const initialUnitRateState: UnitRateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedUnitRateId: undefined,
	showInitWaitingMessage: true
});

export function unitrateReducer(state = initialUnitRateState, action: UnitRateActions): UnitRateState {
	switch  (action.type) {
		case UnitRateActionTypes.UnitRatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedUnitRateId: undefined
		};
		case UnitRateActionTypes.UnitRateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case UnitRateActionTypes.UnitRateOnServerCreated: return {
			...state
		};
		case UnitRateActionTypes.UnitRateCreated: return adapter.addOne(action.payload.unitrate, {
			...state, lastCreatedBlockId: action.payload.unitrate._id
		});
		case UnitRateActionTypes.UnitRateUpdated: return adapter.updateOne(action.payload.partialUnitRate, state);
		case UnitRateActionTypes.UnitRateDeleted: return adapter.removeOne(action.payload.id, state);
		case UnitRateActionTypes.UnitRatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case UnitRateActionTypes.UnitRatePageLoaded: {
			return adapter.addMany(action.payload.unitrate, {
				...initialUnitRateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getUnitRateState = createFeatureSelector<UnitRateState>('unitrate');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
