
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { PaymentPoActions, PaymentPoActionTypes } from './paymentPo.action';
import { PaymentPoModel } from './paymentPo.model';
import { QueryPaymentPoModel } from './querypaymentPo.model';

export interface PaymentPoState extends EntityState<PaymentPoModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPaymentPoId: string;
	lastQuery: QueryPaymentPoModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<PaymentPoModel> = createEntityAdapter<PaymentPoModel>(
	{ selectId: model => model._id, }
);
export const initialPaymentPoState: PaymentPoState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPaymentPoModel({}),
	lastCreatedPaymentPoId: undefined,
	showInitWaitingMessage: true
});
export function paymentPoReducer(state = initialPaymentPoState, action: PaymentPoActions): PaymentPoState {
	switch  (action.type) {
		case PaymentPoActionTypes.PaymentPoPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPaymentPoId: undefined
		};
		case PaymentPoActionTypes.PaymentPoActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PaymentPoActionTypes.PaymentPoOnServerCreated: return {
			...state
		};
		case PaymentPoActionTypes.PaymentPoCreated: return adapter.addOne(action.payload.paymentPo, {
			...state, lastCreatedBlockId: action.payload.paymentPo._id
		});
		case PaymentPoActionTypes.PaymentPoUpdated: return adapter.updateOne(action.payload.partialPaymentPo, state);
		case PaymentPoActionTypes.PaymentPoDeleted: return adapter.removeOne(action.payload.id, state);
		case PaymentPoActionTypes.PaymentPoPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPaymentPoModel({})
		};
		case PaymentPoActionTypes.PaymentPoPageLoaded: {
			return adapter.addMany(action.payload.paymentPo, {
				...initialPaymentPoState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getPaymentPoState = createFeatureSelector<PaymentPoState>('paymentPo');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
