// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { BankActions, BankActionTypes } from './bank.action';
// CRUD

// Models
import { BankModel } from './bank.model';
import { QueryBankModel } from './querybank.model';

// tslint:disable-next-line:no-empty-interface
export interface BankState extends EntityState<BankModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBankId: string;
	lastQuery: QueryBankModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BankModel> = createEntityAdapter<BankModel>(
	{ selectId: model => model._id, }
);

export const initialBankState: BankState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBankModel({}),
	lastCreatedBankId: undefined,
	showInitWaitingMessage: true
});

export function bankReducer(state = initialBankState, action: BankActions): BankState {
	switch  (action.type) {
		case BankActionTypes.BankPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBankId: undefined
		};
		case BankActionTypes.BankActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BankActionTypes.BankOnServerCreated: return {
			...state
		};
		case BankActionTypes.BankCreated: return adapter.addOne(action.payload.bank, {
			...state, lastCreatedBlockId: action.payload.bank._id
		});
		case BankActionTypes.BankUpdated: return adapter.updateOne(action.payload.partialBank, state);
		case BankActionTypes.BankDeleted: return adapter.removeOne(action.payload.id, state);
		case BankActionTypes.BankPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBankModel({})
		};
		case BankActionTypes.BankPageLoaded: {
			return adapter.addMany(action.payload.bank, {
				...initialBankState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBankState = createFeatureSelector<BankState>('bank');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
