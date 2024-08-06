// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { OpeningBalanceActions, OpeningBalanceActionTypes } from './openingBalance.action';
// CRUD

// Models
import { OpeningBalanceModel } from './openingBalance.model';
import { QueryOpeningBalanceModel } from './queryaopeningBalance.model';


// tslint:disable-next-line:no-empty-interface
export interface OpeningBalanceState extends EntityState<OpeningBalanceModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedOpeningBalanceId: string;
	lastQuery: QueryOpeningBalanceModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<OpeningBalanceModel> = createEntityAdapter<OpeningBalanceModel>(
	{ selectId: model => model._id, }
);

export const initialOpeningBalanceState: OpeningBalanceState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryOpeningBalanceModel({}),
	lastCreatedOpeningBalanceId: undefined,
	showInitWaitingMessage: true
});

export function openingBalanceReducer(state = initialOpeningBalanceState, action: OpeningBalanceActions): OpeningBalanceState {
	switch  (action.type) {
		case OpeningBalanceActionTypes.OpeningBalancePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedOpeningBalanceId: undefined
		};
		case OpeningBalanceActionTypes.OpeningBalanceActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case OpeningBalanceActionTypes.OpeningBalanceOnServerCreated: return {
			...state
		};
		case OpeningBalanceActionTypes.OpeningBalanceCreated: return adapter.addOne(action.payload.openingBalance, {
			...state, lastCreatedBlockId: action.payload.openingBalance._id
		});
		case OpeningBalanceActionTypes.OpeningBalanceUpdated: return adapter.updateOne(action.payload.partialOpeningBalance, state);
		case OpeningBalanceActionTypes.OpeningBalanceDeleted: return adapter.removeOne(action.payload.id, state);
		case OpeningBalanceActionTypes.OpeningBalancePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryOpeningBalanceModel({})
		};
		case OpeningBalanceActionTypes.OpeningBalancePageLoaded: {
			return adapter.addMany(action.payload.openingBalance, {
				...initialOpeningBalanceState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getOpeningBalanceState = createFeatureSelector<OpeningBalanceState>('openingBalance');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
