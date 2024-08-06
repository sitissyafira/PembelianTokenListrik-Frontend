
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComTWaterActions, ComTWaterActionTypes } from './comTWater.action';
import { ComTWaterModel } from './comTWater.model';
import { QueryComTWaterModel } from './querycomTWater.model';

export interface ComTWaterState extends EntityState<ComTWaterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComTWaterId: string;
	lastQuery: QueryComTWaterModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComTWaterModel> = createEntityAdapter<ComTWaterModel>(
	{ selectId: model => model._id, }
);
export const initialComTWaterState: ComTWaterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComTWaterModel({}),
	lastCreatedComTWaterId: undefined,
	showInitWaitingMessage: true
});
export function comTWaterReducer(state = initialComTWaterState, action: ComTWaterActions): ComTWaterState {
	switch  (action.type) {
		case ComTWaterActionTypes.ComTWaterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComTWaterId: undefined
		};
		case ComTWaterActionTypes.ComTWaterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComTWaterActionTypes.ComTWaterOnServerCreated: return {
			...state
		};
		case ComTWaterActionTypes.ComTWaterCreated: return adapter.addOne(action.payload.comTWater, {
			...state, lastCreatedBlockId: action.payload.comTWater._id
		});
		case ComTWaterActionTypes.ComTWaterUpdated: return adapter.updateOne(action.payload.partialComTWater, state);
		case ComTWaterActionTypes.ComTWaterDeleted: return adapter.removeOne(action.payload.id, state);
		case ComTWaterActionTypes.ComTWaterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComTWaterModel({})
		};
		case ComTWaterActionTypes.ComTWaterPageLoaded: {
			return adapter.addMany(action.payload.comTWater, {
				...initialComTWaterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComTWaterState = createFeatureSelector<ComTWaterState>('comTWater');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
