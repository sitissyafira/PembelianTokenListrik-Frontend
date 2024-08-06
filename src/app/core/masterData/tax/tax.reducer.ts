
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { TaxActions, TaxActionTypes } from './tax.action';
import { TaxModel } from './tax.model';
import { QueryTaxModel } from './querytax.model';

export interface TaxState extends EntityState<TaxModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTaxId: string;
	lastQuery: QueryTaxModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<TaxModel> = createEntityAdapter<TaxModel>(
	{ selectId: model => model._id, }
);
export const initialTaxState: TaxState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryTaxModel({}),
	lastCreatedTaxId: undefined,
	showInitWaitingMessage: true
});
export function taxReducer(state = initialTaxState, action: TaxActions): TaxState {
	switch  (action.type) {
		case TaxActionTypes.TaxPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTaxId: undefined
		};
		case TaxActionTypes.TaxActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TaxActionTypes.TaxOnServerCreated: return {
			...state
		};
		case TaxActionTypes.TaxCreated: return adapter.addOne(action.payload.tax, {
			...state, lastCreatedBlockId: action.payload.tax._id
		});
		case TaxActionTypes.TaxUpdated: return adapter.updateOne(action.payload.partialTax, state);
		case TaxActionTypes.TaxDeleted: return adapter.removeOne(action.payload.id, state);
		case TaxActionTypes.TaxPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTaxModel({})
		};
		case TaxActionTypes.TaxPageLoaded: {
			return adapter.addMany(action.payload.tax, {
				...initialTaxState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getTaxState = createFeatureSelector<TaxState>('tax');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
