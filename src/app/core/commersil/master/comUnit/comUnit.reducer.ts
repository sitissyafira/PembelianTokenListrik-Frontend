
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComUnitActions, ComUnitActionTypes } from './comUnit.action';
import { ComUnitModel } from './comUnit.model';
import { QueryComUnitModel } from './querycomUnit.model';

export interface ComUnitState extends EntityState<ComUnitModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComUnitId: string;
	lastQuery: QueryComUnitModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComUnitModel> = createEntityAdapter<ComUnitModel>(
	{ selectId: model => model._id, }
);
export const initialComUnitState: ComUnitState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComUnitModel({}),
	lastCreatedComUnitId: undefined,
	showInitWaitingMessage: true
});
export function comUnitReducer(state = initialComUnitState, action: ComUnitActions): ComUnitState {
	switch  (action.type) {
		case ComUnitActionTypes.ComUnitPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComUnitId: undefined
		};
		case ComUnitActionTypes.ComUnitActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComUnitActionTypes.ComUnitOnServerCreated: return {
			...state
		};
		case ComUnitActionTypes.ComUnitCreated: return adapter.addOne(action.payload.comUnit, {
			...state, lastCreatedBlockId: action.payload.comUnit._id
		});
		case ComUnitActionTypes.ComUnitUpdated: return adapter.updateOne(action.payload.partialComUnit, state);
		case ComUnitActionTypes.ComUnitDeleted: return adapter.removeOne(action.payload.id, state);
		case ComUnitActionTypes.ComUnitPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComUnitModel({})
		};
		case ComUnitActionTypes.ComUnitPageLoaded: {
			return adapter.addMany(action.payload.comUnit, {
				...initialComUnitState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComUnitState = createFeatureSelector<ComUnitState>('comUnit');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
