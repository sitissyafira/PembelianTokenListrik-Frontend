// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { FiscalActions, FiscalActionTypes } from './fiscal.action';
// CRUD

// Models
import { FiscalModel } from './fiscal.model';
import { QueryFiscalModel } from './queryfiscal.model';

// tslint:disable-next-line:no-empty-interface
export interface FiscalState extends EntityState<FiscalModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedFiscalId: string;
	lastQuery: QueryFiscalModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<FiscalModel> = createEntityAdapter<FiscalModel>(
	{ selectId: model => model._id, }
);

export const initialFiscalState: FiscalState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryFiscalModel({}),
	lastCreatedFiscalId: undefined,
	showInitWaitingMessage: true
});

export function fiscalReducer(state = initialFiscalState, action: FiscalActions): FiscalState {
	switch  (action.type) {
		case FiscalActionTypes.FiscalPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedFiscalId: undefined
		};
		case FiscalActionTypes.FiscalActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case FiscalActionTypes.FiscalOnServerCreated: return {
			...state
		};
		case FiscalActionTypes.FiscalCreated: return adapter.addOne(action.payload.fiscal, {
			...state, lastCreatedBlockId: action.payload.fiscal._id
		});
		case FiscalActionTypes.FiscalUpdated: return adapter.updateOne(action.payload.partialFiscal, state);
		case FiscalActionTypes.FiscalDeleted: return adapter.removeOne(action.payload.id, state);
		case FiscalActionTypes.FiscalPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryFiscalModel({})
		};
		case FiscalActionTypes.FiscalPageLoaded: {
			return adapter.addMany(action.payload.fiscal, {
				...initialFiscalState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getFiscalState = createFeatureSelector<FiscalState>('fiscal');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
