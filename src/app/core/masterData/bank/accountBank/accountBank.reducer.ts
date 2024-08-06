// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AccountBankActions, AccountBankActionTypes } from './accountBank.action';
// CRUD

// Models
import { AccountBankModel } from './accountBank.model';
import { QueryAccountBankModel } from './queryaccountBank.model';

// tslint:disable-next-line:no-empty-interface
export interface AccountBankState extends EntityState<AccountBankModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAccountBankId: string;
	lastQuery: QueryAccountBankModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AccountBankModel> = createEntityAdapter<AccountBankModel>(
	{ selectId: model => model._id, }
);

export const initialAccountBankState: AccountBankState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAccountBankModel({}),
	lastCreatedAccountBankId: undefined,
	showInitWaitingMessage: true
});

export function accountBankReducer(state = initialAccountBankState, action: AccountBankActions): AccountBankState {
	switch  (action.type) {
		case AccountBankActionTypes.AccountBankPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAccountBankId: undefined
		};
		case AccountBankActionTypes.AccountBankActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AccountBankActionTypes.AccountBankOnServerCreated: return {
			...state
		};
		case AccountBankActionTypes.AccountBankCreated: return adapter.addOne(action.payload.accountBank, {
			...state, lastCreatedBlockId: action.payload.accountBank._id
		});
		case AccountBankActionTypes.AccountBankUpdated: return adapter.updateOne(action.payload.partialAccountBank, state);
		case AccountBankActionTypes.AccountBankDeleted: return adapter.removeOne(action.payload.id, state);
		case AccountBankActionTypes.AccountBankPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAccountBankModel({})
		};
		case AccountBankActionTypes.AccountBankPageLoaded: {
			return adapter.addMany(action.payload.accountBank, {
				...initialAccountBankState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAccountBankState = createFeatureSelector<AccountBankState>('accountBank');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
