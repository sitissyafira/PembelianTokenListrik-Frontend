import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { BudgetingActions, BudgetingActionTypes } from './budgeting.action';
import { BudgetingModel } from './budgeting.model';
import { QueryBudgetingModel } from './querybudgeting.model';

export interface BudgetingState extends EntityState<BudgetingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBudgetingId: string;
	lastQuery: QueryBudgetingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BudgetingModel> = createEntityAdapter<BudgetingModel>(
	{ selectId: model => model._id, }
);

export const initialBudgetingState: BudgetingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBudgetingModel({}),
	lastCreatedBudgetingId: undefined,
	showInitWaitingMessage: true
});

export function budgetingReducer(state = initialBudgetingState, action: BudgetingActions): BudgetingState {
	switch  (action.type) {
		case BudgetingActionTypes.BudgetingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBudgetingId: undefined
		};
		case BudgetingActionTypes.BudgetingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BudgetingActionTypes.BudgetingOnServerCreated: return {
			...state
		};
		case BudgetingActionTypes.BudgetingCreated: return adapter.addOne(action.payload.budgeting, {
			...state, lastCreatedBlockId: action.payload.budgeting._id
		});
		case BudgetingActionTypes.BudgetingUpdated: return adapter.updateOne(action.payload.partialBudgeting, state);
		case BudgetingActionTypes.BudgetingDeleted: return adapter.removeOne(action.payload.id, state);
		case BudgetingActionTypes.BudgetingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBudgetingModel({})
		};
		case BudgetingActionTypes.BudgetingPageLoaded: {
			return adapter.addMany(action.payload.budgeting, {
				...initialBudgetingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBudgetingState = createFeatureSelector<BudgetingState>('budgeting');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
