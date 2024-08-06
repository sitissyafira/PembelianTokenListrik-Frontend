import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { LogFinanceActions, LogFinanceActionTypes } from './logFinance.action';
import { LogFinanceModel } from './logFinance.model';
import { QueryLogFinanceModel } from './querylogFinance.model';

export interface LogFinanceState extends EntityState<LogFinanceModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedLogFinanceId: string;
	lastQuery: QueryLogFinanceModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<LogFinanceModel> = createEntityAdapter<LogFinanceModel>(
	{ selectId: model => model._id, }
);

export const initialLogFinanceState: LogFinanceState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryLogFinanceModel({}),
	lastCreatedLogFinanceId: undefined,
	showInitWaitingMessage: true
});

export function logFinanceReducer(state = initialLogFinanceState, action: LogFinanceActions): LogFinanceState {
	switch  (action.type) {
		case LogFinanceActionTypes.LogFinancePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedLogFinanceId: undefined
		};
		case LogFinanceActionTypes.LogFinanceActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case LogFinanceActionTypes.LogFinanceOnServerCreated: return {
			...state
		};
		case LogFinanceActionTypes.LogFinanceCreated: return adapter.addOne(action.payload.logFinance, {
			...state, lastCreatedBlockId: action.payload.logFinance._id
		});
		case LogFinanceActionTypes.LogFinanceUpdated: return adapter.updateOne(action.payload.partialLogFinance, state);
		case LogFinanceActionTypes.LogFinanceDeleted: return adapter.removeOne(action.payload.id, state);
		case LogFinanceActionTypes.LogFinancePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryLogFinanceModel({})
		};
		case LogFinanceActionTypes.LogFinancePageLoaded: {
			return adapter.addMany(action.payload.logFinance, {
				...initialLogFinanceState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getLogFinanceState = createFeatureSelector<LogFinanceState>('logFinance');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
