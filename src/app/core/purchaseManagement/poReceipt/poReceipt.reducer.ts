
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PoReceiptActions, PoReceiptActionTypes } from './poReceipt.action';
import { PoReceiptModel } from './poReceipt.model';
import { QueryPoReceiptModel } from './querypoReceipt.model';

export interface PoReceiptState extends EntityState<PoReceiptModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPoReceiptId: string;
	lastQuery: QueryPoReceiptModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<PoReceiptModel> = createEntityAdapter<PoReceiptModel>(
	{ selectId: model => model._id, }
);
export const initialPoReceiptState: PoReceiptState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPoReceiptModel({}),
	lastCreatedPoReceiptId: undefined,
	showInitWaitingMessage: true
});
export function poReceiptReducer(state = initialPoReceiptState, action: PoReceiptActions): PoReceiptState {
	switch  (action.type) {
		case PoReceiptActionTypes.PoReceiptPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPoReceiptId: undefined
		};
		case PoReceiptActionTypes.PoReceiptActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PoReceiptActionTypes.PoReceiptOnServerCreated: return {
			...state
		};
		case PoReceiptActionTypes.PoReceiptCreated: return adapter.addOne(action.payload.poReceipt, {
			...state, lastCreatedBlockId: action.payload.poReceipt._id
		});
		case PoReceiptActionTypes.PoReceiptUpdated: return adapter.updateOne(action.payload.partialPoReceipt, state);
		case PoReceiptActionTypes.PoReceiptDeleted: return adapter.removeOne(action.payload.id, state);
		case PoReceiptActionTypes.PoReceiptPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPoReceiptModel({})
		};
		case PoReceiptActionTypes.PoReceiptPageLoaded: {
			return adapter.addMany(action.payload.poReceipt, {
				...initialPoReceiptState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getPoReceiptState = createFeatureSelector<PoReceiptState>('poReceipt');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
