
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComTPowerActions, ComTPowerActionTypes } from './comTPower.action';
import { ComTPowerModel } from './comTPower.model';
import { QueryComTPowerModel } from './querycomTPower.model';

export interface ComTPowerState extends EntityState<ComTPowerModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComTPowerId: string;
	lastQuery: QueryComTPowerModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComTPowerModel> = createEntityAdapter<ComTPowerModel>(
	{ selectId: model => model._id, }
);
export const initialComTPowerState: ComTPowerState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComTPowerModel({}),
	lastCreatedComTPowerId: undefined,
	showInitWaitingMessage: true
});
export function comTPowerReducer(state = initialComTPowerState, action: ComTPowerActions): ComTPowerState {
	switch  (action.type) {
		case ComTPowerActionTypes.ComTPowerPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComTPowerId: undefined
		};
		case ComTPowerActionTypes.ComTPowerActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComTPowerActionTypes.ComTPowerOnServerCreated: return {
			...state
		};
		case ComTPowerActionTypes.ComTPowerCreated: return adapter.addOne(action.payload.comTPower, {
			...state, lastCreatedBlockId: action.payload.comTPower._id
		});
		case ComTPowerActionTypes.ComTPowerUpdated: return adapter.updateOne(action.payload.partialComTPower, state);
		case ComTPowerActionTypes.ComTPowerDeleted: return adapter.removeOne(action.payload.id, state);
		case ComTPowerActionTypes.ComTPowerPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComTPowerModel({})
		};
		case ComTPowerActionTypes.ComTPowerPageLoaded: {
			return adapter.addMany(action.payload.comTPower, {
				...initialComTPowerState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComTPowerState = createFeatureSelector<ComTPowerState>('comTPower');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
