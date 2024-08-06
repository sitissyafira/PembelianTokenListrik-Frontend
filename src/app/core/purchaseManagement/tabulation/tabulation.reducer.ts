
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { TabulationActions, TabulationActionTypes } from './tabulation.action';
import { TabulationModel } from './tabulation.model';
import { QueryTabulationModel } from './querytabulation.model';

export interface TabulationState extends EntityState<TabulationModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTabulationId: string;
	lastQuery: QueryTabulationModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<TabulationModel> = createEntityAdapter<TabulationModel>(
	{ selectId: model => model._id, }
);
export const initialTabulationState: TabulationState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryTabulationModel({}),
	lastCreatedTabulationId: undefined,
	showInitWaitingMessage: true
});
export function tabulationReducer(state = initialTabulationState, action: TabulationActions): TabulationState {
	switch  (action.type) {
		case TabulationActionTypes.TabulationPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTabulationId: undefined
		};
		case TabulationActionTypes.TabulationActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TabulationActionTypes.TabulationOnServerCreated: return {
			...state
		};
		case TabulationActionTypes.TabulationCreated: return adapter.addOne(action.payload.tabulation, {
			...state, lastCreatedBlockId: action.payload.tabulation._id
		});
		case TabulationActionTypes.TabulationUpdated: return adapter.updateOne(action.payload.partialTabulation, state);
		case TabulationActionTypes.TabulationDeleted: return adapter.removeOne(action.payload.id, state);
		case TabulationActionTypes.TabulationPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTabulationModel({})
		};
		case TabulationActionTypes.TabulationPageLoaded: {
			return adapter.addMany(action.payload.tabulation, {
				...initialTabulationState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getTabulationState = createFeatureSelector<TabulationState>('tabulation');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
