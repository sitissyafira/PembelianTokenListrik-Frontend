// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { TransactionsActions, TransactionsActionTypes } from './transactions.action';
// CRUD

// Models
import { TransactionsModel } from './transactions.model';
import { QueryTransactionsModel } from './querytransactions.model';

// tslint:disable-next-line:no-empty-interface
export interface TransactionsState extends EntityState<TransactionsModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTransactionsId: string;
	lastQuery: QueryTransactionsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TransactionsModel> = createEntityAdapter<TransactionsModel>(
	{ selectId: model => model._id, }
);

export const initialTransactionsState: TransactionsState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryTransactionsModel({}),
	lastCreatedTransactionsId: undefined,
	showInitWaitingMessage: true
});

export function transactionsReducer(state = initialTransactionsState, action: TransactionsActions): TransactionsState {
	switch (action.type) {
		case TransactionsActionTypes.TransactionsPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTransactionsId: undefined
		};
		case TransactionsActionTypes.TransactionsActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TransactionsActionTypes.TransactionsOnServerCreated: return {
			...state
		};
		case TransactionsActionTypes.TransactionsCreated: return adapter.addOne(action.payload.transactions, {
			...state, lastCreatedBlockId: action.payload.transactions._id
		});
		case TransactionsActionTypes.TransactionsUpdated: return adapter.updateOne(action.payload.partialTransactions, state);
		case TransactionsActionTypes.TransactionsDeleted: return adapter.removeOne(action.payload.id, state);
		case TransactionsActionTypes.TransactionsPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTransactionsModel({})
		};
		case TransactionsActionTypes.TransactionsPageLoaded: {
			return adapter.addMany(action.payload.transactions, {
				...initialTransactionsState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getTransactionsState = createFeatureSelector<TransactionsState>('transactions');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
