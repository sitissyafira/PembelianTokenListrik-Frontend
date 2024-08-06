
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { QuotationActions, QuotationActionTypes } from './quotation.action';
import { QuotationModel } from './quotation.model';
import { QueryQuotationModel } from './queryquotation.model';

export interface QuotationState extends EntityState<QuotationModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedQuotationId: string;
	lastQuery: QueryQuotationModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<QuotationModel> = createEntityAdapter<QuotationModel>(
	{ selectId: model => model._id, }
);
export const initialQuotationState: QuotationState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryQuotationModel({}),
	lastCreatedQuotationId: undefined,
	showInitWaitingMessage: true
});
export function quotationReducer(state = initialQuotationState, action: QuotationActions): QuotationState {
	switch  (action.type) {
		case QuotationActionTypes.QuotationPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedQuotationId: undefined
		};
		case QuotationActionTypes.QuotationActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case QuotationActionTypes.QuotationOnServerCreated: return {
			...state
		};
		case QuotationActionTypes.QuotationCreated: return adapter.addOne(action.payload.quotation, {
			...state, lastCreatedBlockId: action.payload.quotation._id
		});
		case QuotationActionTypes.QuotationUpdated: return adapter.updateOne(action.payload.partialQuotation, state);
		case QuotationActionTypes.QuotationDeleted: return adapter.removeOne(action.payload.id, state);
		case QuotationActionTypes.QuotationPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryQuotationModel({})
		};
		case QuotationActionTypes.QuotationPageLoaded: {
			return adapter.addMany(action.payload.quotation, {
				...initialQuotationState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getQuotationState = createFeatureSelector<QuotationState>('quotation');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
