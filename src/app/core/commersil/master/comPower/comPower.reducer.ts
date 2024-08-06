
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComPowerActions, ComPowerActionTypes } from './comPower.action';
import { ComPowerModel } from './comPower.model';
import { QueryComPowerModel } from './querycomPower.model';

export interface ComPowerState extends EntityState<ComPowerModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComPowerId: string;
	lastQuery: QueryComPowerModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComPowerModel> = createEntityAdapter<ComPowerModel>(
	{ selectId: model => model._id, }
);
export const initialComPowerState: ComPowerState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComPowerModel({}),
	lastCreatedComPowerId: undefined,
	showInitWaitingMessage: true
});
export function comPowerReducer(state = initialComPowerState, action: ComPowerActions): ComPowerState {
	switch  (action.type) {
		case ComPowerActionTypes.ComPowerPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComPowerId: undefined
		};
		case ComPowerActionTypes.ComPowerActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComPowerActionTypes.ComPowerOnServerCreated: return {
			...state
		};
		case ComPowerActionTypes.ComPowerCreated: return adapter.addOne(action.payload.comPower, {
			...state, lastCreatedBlockId: action.payload.comPower._id
		});
		case ComPowerActionTypes.ComPowerUpdated: return adapter.updateOne(action.payload.partialComPower, state);
		case ComPowerActionTypes.ComPowerDeleted: return adapter.removeOne(action.payload.id, state);
		case ComPowerActionTypes.ComPowerPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComPowerModel({})
		};
		case ComPowerActionTypes.ComPowerPageLoaded: {
			return adapter.addMany(action.payload.comPower, {
				...initialComPowerState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComPowerState = createFeatureSelector<ComPowerState>('comPower');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
