// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PowerTransactionActions, PowerTransactionActionTypes } from './transaction.action';
// CRUD

// Models
import { PowerTransactionModel } from './transaction.model';
import { QueryPowerTransactionModel } from './querytransaction.model';

// tslint:disable-next-line:no-empty-interface
export interface PowerTransactionState extends EntityState<PowerTransactionModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	allTotalCount: number;
	lastCreatedPowerTransactionId: string;
	lastQuery: QueryPowerTransactionModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PowerTransactionModel> = createEntityAdapter<PowerTransactionModel>(
	{ selectId: model => model._id, }
);

export const initialPowerTransactionState: PowerTransactionState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	allTotalCount: 0,
	lastQuery:  new QueryPowerTransactionModel({}),
	lastCreatedPowerTransactionId: undefined,
	showInitWaitingMessage: true
});

export function powertransactionReducer(state = initialPowerTransactionState, action: PowerTransactionActions): PowerTransactionState {
	switch  (action.type) {
		case PowerTransactionActionTypes.PowerTransactionPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPowerTransactionId: undefined
		};
		case PowerTransactionActionTypes.PowerTransactionActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PowerTransactionActionTypes.PowerTransactionOnServerCreated: return {
			...state
		};
		case PowerTransactionActionTypes.PowerTransactionCreated: return adapter.addOne(action.payload.powertransaction, {
			...state, lastCreatedBlockId: action.payload.powertransaction._id
		});
		case PowerTransactionActionTypes.PowerTransactionUpdated: return adapter.updateOne(action.payload.partialPowerTransaction, state);
		case PowerTransactionActionTypes.PowerTransactionDeleted: return adapter.removeOne(action.payload.id, state);
		case PowerTransactionActionTypes.PowerTransactionPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPowerTransactionModel({})
		};
		case PowerTransactionActionTypes.PowerTransactionPageLoaded: {
			return adapter.addMany(action.payload.powertransaction, {
				...initialPowerTransactionState,
				totalCount: action.payload.totalCount,
				allTotalCount: action.payload.allTotalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPowerTransactionState = createFeatureSelector<PowerTransactionState>('powertransaction');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
