// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { FixedActions, FixedActionTypes } from './fixed.action';
// CRUD

// Models
import { FixedModel } from './fixed.model';
import { QueryFixedModel } from './queryfixed.model';

// tslint:disable-next-line:no-empty-interface
export interface FixedState extends EntityState<FixedModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedFixedId: string;
	lastQuery: QueryFixedModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FixedModel> = createEntityAdapter<FixedModel>(
	{ selectId: model => model._id, }
);

export const initialFixedState: FixedState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryFixedModel({}),
	lastCreatedFixedId: undefined,
	showInitWaitingMessage: true
});

export function fixedReducer(state = initialFixedState, action: FixedActions): FixedState {
	switch  (action.type) {
		case FixedActionTypes.FixedPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedFixedId: undefined
		};
		case FixedActionTypes.FixedActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case FixedActionTypes.FixedOnServerCreated: return {
			...state
		};
		case FixedActionTypes.FixedCreated: return adapter.addOne(action.payload.fixed, {
			...state, lastCreatedBlockId: action.payload.fixed._id
		});
		case FixedActionTypes.FixedUpdated: return adapter.updateOne(action.payload.partialFixed, state);
		case FixedActionTypes.FixedDeleted: return adapter.removeOne(action.payload.id, state);
		case FixedActionTypes.FixedPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryFixedModel({})
		};
		case FixedActionTypes.FixedPageLoaded: {
			return adapter.addMany(action.payload.fixed, {
				...initialFixedState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getFixedState = createFeatureSelector<FixedState>('fixed');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
