
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { BillComActions, BillComActionTypes } from './billCom.action';
import { BillComModel } from './billCom.model';
import { QueryBillComModel } from './querybillCom.model';

export interface BillComState extends EntityState<BillComModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBillComId: string;
	lastQuery: QueryBillComModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<BillComModel> = createEntityAdapter<BillComModel>(
	{ selectId: model => model._id, }
);
export const initialBillComState: BillComState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBillComModel({}),
	lastCreatedBillComId: undefined,
	showInitWaitingMessage: true
});
export function billComReducer(state = initialBillComState, action: BillComActions): BillComState {
	switch  (action.type) {
		case BillComActionTypes.BillComPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBillComId: undefined
		};
		case BillComActionTypes.BillComActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BillComActionTypes.BillComOnServerCreated: return {
			...state
		};
		case BillComActionTypes.BillComCreated: return adapter.addOne(action.payload.billCom, {
			...state, lastCreatedBlockId: action.payload.billCom._id
		});
		case BillComActionTypes.BillComUpdated: return adapter.updateOne(action.payload.partialBillCom, state);
		case BillComActionTypes.BillComDeleted: return adapter.removeOne(action.payload.id, state);
		case BillComActionTypes.BillComPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBillComModel({})
		};
		case BillComActionTypes.BillComPageLoaded: {
			return adapter.addMany(action.payload.billCom, {
				...initialBillComState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getBillComState = createFeatureSelector<BillComState>('billCom');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
