// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { WaterRateActions, WaterRateActionTypes } from './rate.action';
// CRUD
import { QueryWaterRateModel } from './queryrate.model';
// Models
import { WaterRateModel } from './rate.model';

// tslint:disable-next-line:no-empty-interface
export interface WaterRateState extends EntityState<WaterRateModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedWaterRateId: string;
	lastQuery: QueryWaterRateModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<WaterRateModel> = createEntityAdapter<WaterRateModel>(
	{ selectId: model => model._id, }
);

export const initialWaterRateState: WaterRateState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryWaterRateModel({}),
	lastCreatedWaterRateId: undefined,
	showInitWaitingMessage: true
});

export function waterrateReducer(state = initialWaterRateState, action: WaterRateActions): WaterRateState {
	switch  (action.type) {
		case WaterRateActionTypes.WaterRatePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedWaterRateId: undefined
		};
		case WaterRateActionTypes.WaterRateActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case WaterRateActionTypes.WaterRateOnServerCreated: return {
			...state
		};
		case WaterRateActionTypes.WaterRateCreated: return adapter.addOne(action.payload.waterrate, {
			...state, lastCreatedWaterRateId: action.payload.waterrate._id
		});
		case WaterRateActionTypes.WaterRateUpdated: return adapter.updateOne(action.payload.partialWaterRate, state);
		case WaterRateActionTypes.WaterRateDeleted: return adapter.removeOne(action.payload.id, state);
		case WaterRateActionTypes.WaterRatePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryWaterRateModel({})
		};
		case WaterRateActionTypes.WaterRatePageLoaded: {
			return adapter.addMany(action.payload.waterrate, {
				...initialWaterRateState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getWaterRateState = createFeatureSelector<WaterRateState>('waterrate');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
