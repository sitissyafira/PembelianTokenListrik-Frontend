// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { WaterTransactionActions, WaterTransactionActionTypes } from './transaction.action';
// CRUD

// Models
import { WaterTransactionModel } from './transaction.model';
import { QueryWaterTransactionModel } from './querytransaction.model';

// tslint:disable-next-line:no-empty-interface
export interface WaterTransactionState extends EntityState<WaterTransactionModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	allTotalCount: number;
	lastCreatedWaterTransactionId: string;
	lastQuery: QueryWaterTransactionModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<WaterTransactionModel> = createEntityAdapter<WaterTransactionModel>(
	{ selectId: model => model._id, }
);

export const initialWaterTransactionState: WaterTransactionState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	allTotalCount: 0,
	lastQuery:  new QueryWaterTransactionModel({}),
	lastCreatedWaterTransactionId: undefined,
	showInitWaitingMessage: true
});

export function watertransactionReducer(state = initialWaterTransactionState, action: WaterTransactionActions): WaterTransactionState {
	switch  (action.type) {
		case WaterTransactionActionTypes.WaterTransactionPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedWaterTransactionId: undefined
		};
		case WaterTransactionActionTypes.WaterTransactionActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case WaterTransactionActionTypes.WaterTransactionOnServerCreated: return {
			...state
		};
		case WaterTransactionActionTypes.WaterTransactionCreated: return adapter.addOne(action.payload.watertransaction, {
			...state, lastCreatedBlockId: action.payload.watertransaction._id
		});
		case WaterTransactionActionTypes.WaterTransactionUpdated: return adapter.updateOne(action.payload.partialWaterTransaction, state);
		case WaterTransactionActionTypes.WaterTransactionDeleted: return adapter.removeOne(action.payload.id, state);
		case WaterTransactionActionTypes.WaterTransactionPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryWaterTransactionModel({})
		};
		case WaterTransactionActionTypes.WaterTransactionPageLoaded: {
			return adapter.addMany(action.payload.watertransaction, {
				...initialWaterTransactionState,
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

export const getWaterTransactionState = createFeatureSelector<WaterTransactionState>('watertransaction');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
