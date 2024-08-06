
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { CurrencyActions, CurrencyActionTypes } from './currency.action';
import { CurrencyModel } from './currency.model';
import { QueryCurrencyModel } from './querycurrency.model';

export interface CurrencyState extends EntityState<CurrencyModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedCurrencyId: string;
	lastQuery: QueryCurrencyModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<CurrencyModel> = createEntityAdapter<CurrencyModel>(
	{ selectId: model => model._id, }
);
export const initialCurrencyState: CurrencyState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryCurrencyModel({}),
	lastCreatedCurrencyId: undefined,
	showInitWaitingMessage: true
});
export function currencyReducer(state = initialCurrencyState, action: CurrencyActions): CurrencyState {
	switch  (action.type) {
		case CurrencyActionTypes.CurrencyPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedCurrencyId: undefined
		};
		case CurrencyActionTypes.CurrencyActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case CurrencyActionTypes.CurrencyOnServerCreated: return {
			...state
		};
		case CurrencyActionTypes.CurrencyCreated: return adapter.addOne(action.payload.currency, {
			...state, lastCreatedBlockId: action.payload.currency._id
		});
		case CurrencyActionTypes.CurrencyUpdated: return adapter.updateOne(action.payload.partialCurrency, state);
		case CurrencyActionTypes.CurrencyDeleted: return adapter.removeOne(action.payload.id, state);
		case CurrencyActionTypes.CurrencyPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryCurrencyModel({})
		};
		case CurrencyActionTypes.CurrencyPageLoaded: {
			return adapter.addMany(action.payload.currency, {
				...initialCurrencyState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getCurrencyState = createFeatureSelector<CurrencyState>('currency');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
