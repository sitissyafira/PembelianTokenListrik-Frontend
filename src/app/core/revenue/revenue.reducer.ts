// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RevenueActions, RevenueActionTypes } from './revenue.action';
// CRUD

// Models
import { RevenueModel } from './revenue.model';
import { QueryRevenueModel } from './queryrevenue.model';

// tslint:disable-next-line:no-empty-interface
export interface RevenueState extends EntityState<RevenueModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRevenueId: string;
	lastQuery: QueryRevenueModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RevenueModel> = createEntityAdapter<RevenueModel>(
	{ selectId: model => model._id, }
);

export const initialRevenueState: RevenueState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRevenueModel({}),
	lastCreatedRevenueId: undefined,
	showInitWaitingMessage: true
});

export function revenueReducer(state = initialRevenueState, action: RevenueActions): RevenueState {
	switch  (action.type) {
		case RevenueActionTypes.RevenuePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRevenueId: undefined
		};
		case RevenueActionTypes.RevenueActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RevenueActionTypes.RevenueOnServerCreated: return {
			...state
		};
		case RevenueActionTypes.RevenueCreated: return adapter.addOne(action.payload.revenue, {
			...state, lastCreatedBlockId: action.payload.revenue._id
		});
		case RevenueActionTypes.RevenueUpdated: return adapter.updateOne(action.payload.partialRevenue, state);
		case RevenueActionTypes.RevenueDeleted: return adapter.removeOne(action.payload.id, state);
		case RevenueActionTypes.RevenuePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRevenueModel({})
		};
		case RevenueActionTypes.RevenuePageLoaded: {
			return adapter.addMany(action.payload.revenue, {
				...initialRevenueState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRevenueState = createFeatureSelector<RevenueState>('revenue');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
