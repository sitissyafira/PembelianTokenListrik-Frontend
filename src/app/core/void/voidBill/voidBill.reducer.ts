// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { VoidBillActions, VoidBillActionTypes } from './voidBill.action';
// CRUD
import { QueryVoidBillModel } from './queryvoidBill.model';
// Models
import { VoidBillModel } from './voidBill.model';

// tslint:disable-next-line:no-empty-interface
export interface VoidBillState extends EntityState<VoidBillModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedVoidBillId: string;
	lastQuery: QueryVoidBillModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<VoidBillModel> = createEntityAdapter<VoidBillModel>(
	{ selectId: model => model._id, }
);

export const initialVoidBillState: VoidBillState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryVoidBillModel({}),
	lastCreatedVoidBillId: undefined,
	showInitWaitingMessage: true
});

export function voidBillReducer(state = initialVoidBillState, action: VoidBillActions): VoidBillState {
	switch (action.type) {
		case VoidBillActionTypes.VoidBillPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVoidBillId: undefined
		};
		case VoidBillActionTypes.VoidBillActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VoidBillActionTypes.VoidBillOnServerCreated: return {
			...state
		};
		case VoidBillActionTypes.VoidBillCreated: return adapter.addOne(action.payload.voidBill, {
			...state, lastCreatedVoidBillId: action.payload.voidBill._id
		});
		case VoidBillActionTypes.VoidBillUpdated: return adapter.updateOne(action.payload.partialVoidBill, state);
		case VoidBillActionTypes.VoidBillDeleted: return adapter.removeOne(action.payload.id, state);
		case VoidBillActionTypes.VoidBillPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryVoidBillModel({})
		};
		case VoidBillActionTypes.VoidBillPageLoaded: {
			return adapter.addMany(action.payload.voidBill, {
				...initialVoidBillState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getVoidBillState = createFeatureSelector<VoidBillState>('voidBill');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
