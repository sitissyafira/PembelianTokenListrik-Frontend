// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { CashbActions, CashbActionTypes } from './cashb.action';
// CRUD

// Models
import { CashbModel } from './cashb.model';
import { QueryCashbModel } from './queryb.model';

// tslint:disable-next-line:no-empty-interface
export interface CashbState extends EntityState<CashbModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedCashbId: string;
	lastQuery: QueryCashbModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CashbModel> = createEntityAdapter<CashbModel>(
	{ selectId: model => model._id, }
);

export const initialCashbState: CashbState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryCashbModel({}),
	lastCreatedCashbId: undefined,
	showInitWaitingMessage: true
});

export function cashbReducer(state = initialCashbState, action: CashbActions): CashbState {
	switch  (action.type) {
		case CashbActionTypes.CashbPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedCashbId: undefined
		};
		case CashbActionTypes.CashbActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case CashbActionTypes.CashbOnServerCreated: return {
			...state
		};
		case CashbActionTypes.CashbCreated: return adapter.addOne(action.payload.cashb, {
			...state, lastCreatedBlockId: action.payload.cashb._id
		});
		case CashbActionTypes.CashbUpdated: return adapter.updateOne(action.payload.partialCashb, state);
		case CashbActionTypes.CashbDeleted: return adapter.removeOne(action.payload.id, state);
		case CashbActionTypes.CashbPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryCashbModel({})
		};
		case CashbActionTypes.CashbPageLoaded: {
			return adapter.addMany(action.payload.cashb, {
				...initialCashbState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getCashbState = createFeatureSelector<CashbState>('cashb');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
