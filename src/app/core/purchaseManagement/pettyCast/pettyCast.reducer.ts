
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PettyCastActions, PettyCastActionTypes } from './pettyCast.action';
import { PettyCastModel } from './pettyCast.model';
import { QueryPettyCastModel } from './querypettyCast.model';

export interface PettyCastState extends EntityState<PettyCastModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPettyCastId: string;
	lastQuery: QueryPettyCastModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<PettyCastModel> = createEntityAdapter<PettyCastModel>(
	{ selectId: model => model._id, }
);
export const initialPettyCastState: PettyCastState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPettyCastModel({}),
	lastCreatedPettyCastId: undefined,
	showInitWaitingMessage: true
});
export function pettyCastReducer(state = initialPettyCastState, action: PettyCastActions): PettyCastState {
	switch  (action.type) {
		case PettyCastActionTypes.PettyCastPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPettyCastId: undefined
		};
		case PettyCastActionTypes.PettyCastActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PettyCastActionTypes.PettyCastOnServerCreated: return {
			...state
		};
		case PettyCastActionTypes.PettyCastCreated: return adapter.addOne(action.payload.pettyCast, {
			...state, lastCreatedBlockId: action.payload.pettyCast._id
		});
		case PettyCastActionTypes.PettyCastUpdated: return adapter.updateOne(action.payload.partialPettyCast, state);
		case PettyCastActionTypes.PettyCastDeleted: return adapter.removeOne(action.payload.id, state);
		case PettyCastActionTypes.PettyCastPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPettyCastModel({})
		};
		case PettyCastActionTypes.PettyCastPageLoaded: {
			return adapter.addMany(action.payload.pettyCast, {
				...initialPettyCastState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getPettyCastState = createFeatureSelector<PettyCastState>('pettyCast');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
