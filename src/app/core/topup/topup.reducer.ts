import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { TopUpActions, TopUpActionTypes } from './topup.action';
// CRUD
import { QueryTopUpModel } from './querytopup.model';
// Models
import { TopUpModel } from './topup.model';

export interface TopUpState extends EntityState<TopUpModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTopUpId: string;
	lastQuery: QueryTopUpModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TopUpModel> = createEntityAdapter<TopUpModel>(
	{ selectId: model => model._id, }
);

export const initialTopUpState: TopUpState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryTopUpModel({}),
	lastCreatedTopUpId: undefined,
	showInitWaitingMessage: true
});

export function topupReducer(state = initialTopUpState, action: TopUpActions): TopUpState {
	switch (action.type) {
		case TopUpActionTypes.TopUpPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTopUpId: undefined
		};
		case TopUpActionTypes.TopUpActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TopUpActionTypes.TopUpOnServerCreated: return {
			...state
		};
		case TopUpActionTypes.TopUpCreated: return adapter.addOne(action.payload.topup, {
			...state, lastCreatedBlockId: action.payload.topup._id
		});
		case TopUpActionTypes.TopUpUpdated: return adapter.updateOne(action.payload.partialTopUp, state);
		case TopUpActionTypes.TopUpDeleted: return adapter.removeOne(action.payload.id, state);
		case TopUpActionTypes.TopUpPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTopUpModel({})
		};
		case TopUpActionTypes.TopUpPageLoaded: {
			return adapter.addMany(action.payload.topup, {
				...initialTopUpState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getTopUpState = createFeatureSelector<TopUpState>('topup');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
