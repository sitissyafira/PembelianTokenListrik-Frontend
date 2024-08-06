// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { GasTransactionActions, GasTransactionActionTypes } from './transaction.action';
// CRUD

// Models
import { GasTransactionModel } from './transaction.model';
import { QueryGasTransactionModel } from './querytransaction.model';

// tslint:disable-next-line:no-empty-interface
export interface GasTransactionState extends EntityState<GasTransactionModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedGasTransactionId: string;
	lastQuery: QueryGasTransactionModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<GasTransactionModel> = createEntityAdapter<GasTransactionModel>(
	{ selectId: model => model._id, }
);

export const initialGasTransactionState: GasTransactionState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryGasTransactionModel({}),
	lastCreatedGasTransactionId: undefined,
	showInitWaitingMessage: true
});

export function gastransactionReducer(state = initialGasTransactionState, action: GasTransactionActions): GasTransactionState {
	switch  (action.type) {
		case GasTransactionActionTypes.GasTransactionPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedGasTransactionId: undefined
		};
		case GasTransactionActionTypes.GasTransactionActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case GasTransactionActionTypes.GasTransactionOnServerCreated: return {
			...state
		};
		case GasTransactionActionTypes.GasTransactionCreated: return adapter.addOne(action.payload.gastransaction, {
			...state, lastCreatedBlockId: action.payload.gastransaction._id
		});
		case GasTransactionActionTypes.GasTransactionUpdated: return adapter.updateOne(action.payload.partialGasTransaction, state);
		case GasTransactionActionTypes.GasTransactionDeleted: return adapter.removeOne(action.payload.id, state);
		case GasTransactionActionTypes.GasTransactionPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryGasTransactionModel({})
		};
		case GasTransactionActionTypes.GasTransactionPageLoaded: {
			return adapter.addMany(action.payload.gastransaction, {
				...initialGasTransactionState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getGasTransactionState = createFeatureSelector<GasTransactionState>('gastransaction');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
