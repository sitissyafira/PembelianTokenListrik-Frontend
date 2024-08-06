
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComWaterActions, ComWaterActionTypes } from './comWater.action';
import { ComWaterModel } from './comWater.model';
import { QueryComWaterModel } from './querycomWater.model';

export interface ComWaterState extends EntityState<ComWaterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComWaterId: string;
	lastQuery: QueryComWaterModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComWaterModel> = createEntityAdapter<ComWaterModel>(
	{ selectId: model => model._id, }
);
export const initialComWaterState: ComWaterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComWaterModel({}),
	lastCreatedComWaterId: undefined,
	showInitWaitingMessage: true
});
export function comWaterReducer(state = initialComWaterState, action: ComWaterActions): ComWaterState {
	switch  (action.type) {
		case ComWaterActionTypes.ComWaterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComWaterId: undefined
		};
		case ComWaterActionTypes.ComWaterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComWaterActionTypes.ComWaterOnServerCreated: return {
			...state
		};
		case ComWaterActionTypes.ComWaterCreated: return adapter.addOne(action.payload.comWater, {
			...state, lastCreatedBlockId: action.payload.comWater._id
		});
		case ComWaterActionTypes.ComWaterUpdated: return adapter.updateOne(action.payload.partialComWater, state);
		case ComWaterActionTypes.ComWaterDeleted: return adapter.removeOne(action.payload.id, state);
		case ComWaterActionTypes.ComWaterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComWaterModel({})
		};
		case ComWaterActionTypes.ComWaterPageLoaded: {
			return adapter.addMany(action.payload.comWater, {
				...initialComWaterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComWaterState = createFeatureSelector<ComWaterState>('comWater');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
