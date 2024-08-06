// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AccountHistoryActions, AccountHistoryActionTypes } from './accountHistory.action';
// CRUD

// Models
import { AccountHistoryModel } from './accountHistory.model';
import { QueryAccountHistoryModel } from './queryaccountHistory.model';

// tslint:disable-next-line:no-empty-interface
export interface AccountHistoryState extends EntityState<AccountHistoryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAccountHistoryId: string;
	lastQuery: QueryAccountHistoryModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AccountHistoryModel> = createEntityAdapter<AccountHistoryModel>(
	{ selectId: model => model._id, }
);

export const initialAccountHistoryState: AccountHistoryState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAccountHistoryModel({}),
	lastCreatedAccountHistoryId: undefined,
	showInitWaitingMessage: true
});

export function accountHistoryReducer(state = initialAccountHistoryState, action: AccountHistoryActions): AccountHistoryState {
	switch  (action.type) {
		case AccountHistoryActionTypes.AccountHistoryPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAccountHistoryId: undefined
		};
		case AccountHistoryActionTypes.AccountHistoryActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AccountHistoryActionTypes.AccountHistoryOnServerCreated: return {
			...state
		};
		case AccountHistoryActionTypes.AccountHistoryCreated: return adapter.addOne(action.payload.accountHistory, {
			...state, lastCreatedBlockId: action.payload.accountHistory._id
		});
		case AccountHistoryActionTypes.AccountHistoryUpdated: return adapter.updateOne(action.payload.partialAccountHistory, state);
		case AccountHistoryActionTypes.AccountHistoryDeleted: return adapter.removeOne(action.payload.id, state);
		case AccountHistoryActionTypes.AccountHistoryPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAccountHistoryModel({})
		};
		case AccountHistoryActionTypes.AccountHistoryPageLoaded: {
			return adapter.addMany(action.payload.accountHistory, {
				...initialAccountHistoryState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAccountHistoryState = createFeatureSelector<AccountHistoryState>('accountHistory');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
