
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { BillLogActions, BillLogActionTypes } from './billLog.action';
import { BillLogModel } from './billLog.model';
import { QueryBillLogModel } from './querybillLog.model';

export interface BillLogState extends EntityState<BillLogModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBillLogId: string;
	lastQuery: QueryBillLogModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BillLogModel> = createEntityAdapter<BillLogModel>(
	{ selectId: model => model._id, }
);

export const initialBillLogState: BillLogState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBillLogModel({}),
	lastCreatedBillLogId: undefined,
	showInitWaitingMessage: true
});

export function billLogReducer(state = initialBillLogState, action: BillLogActions): BillLogState {
	switch  (action.type) {
		case BillLogActionTypes.BillLogPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBillLogId: undefined
		};
		case BillLogActionTypes.BillLogActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BillLogActionTypes.BillLogOnServerCreated: return {
			...state
		};
		case BillLogActionTypes.BillLogCreated: return adapter.addOne(action.payload.billLog, {
			...state, lastCreatedBlockId: action.payload.billLog._id
		});
		case BillLogActionTypes.BillLogUpdated: return adapter.updateOne(action.payload.partialBillLog, state);
		case BillLogActionTypes.BillLogDeleted: return adapter.removeOne(action.payload.id, state);
		case BillLogActionTypes.BillLogPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBillLogModel({})
		};
		case BillLogActionTypes.BillLogPageLoaded: {
			return adapter.addMany(action.payload.billLog, {
				...initialBillLogState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBillLogState = createFeatureSelector<BillLogState>('billLog');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
