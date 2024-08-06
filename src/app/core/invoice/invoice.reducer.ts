// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { InvoiceActions, InvoiceActionTypes } from './invoice.action';
// CRUD
import { QueryInvoiceModel } from './queryinvoice.model';
// Models
import { InvoiceModel } from './invoice.model';

// tslint:disable-next-line:no-empty-interface
export interface InvoiceState extends EntityState<InvoiceModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedInvoiceId: string;
	lastQuery: QueryInvoiceModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<InvoiceModel> = createEntityAdapter<InvoiceModel>(
	{ selectId: model => model._id, }
);

export const initialInvoiceState: InvoiceState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryInvoiceModel({}),
	lastCreatedInvoiceId: undefined,
	showInitWaitingMessage: true
});

export function invoiceReducer(state = initialInvoiceState, action: InvoiceActions): InvoiceState {
	switch  (action.type) {
		case InvoiceActionTypes.InvoicePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedInvoiceId: undefined
		};
		case InvoiceActionTypes.InvoiceActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case InvoiceActionTypes.InvoiceOnServerCreated: return {
			...state
		};
		case InvoiceActionTypes.InvoiceCreated: return adapter.addOne(action.payload.invoice, {
			...state, lastCreatedInvoiceId: action.payload.invoice._id
		});
		case InvoiceActionTypes.InvoiceUpdated: return adapter.updateOne(action.payload.partialInvoice, state);
		case InvoiceActionTypes.InvoiceDeleted: return adapter.removeOne(action.payload.id, state);
		case InvoiceActionTypes.InvoicePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryInvoiceModel({})
		};
		case InvoiceActionTypes.InvoicePageLoaded: {
			return adapter.addMany(action.payload.invoice, {
				...initialInvoiceState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getInvoiceState = createFeatureSelector<InvoiceState>('invoice');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
