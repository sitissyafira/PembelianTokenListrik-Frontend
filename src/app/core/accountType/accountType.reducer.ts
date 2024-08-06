// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AccountTypeActions, AccountTypeActionTypes } from './accountType.action';
// CRUD

// Models
import { AccountTypeModel } from './accountType.model';
import { QueryAccountTypeModel } from './queryaccounttype.model';

// tslint:disable-next-line:no-empty-interface
export interface AccountTypeState extends EntityState<AccountTypeModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAccountTypeId: string;
	lastQuery: QueryAccountTypeModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AccountTypeModel> = createEntityAdapter<AccountTypeModel>(
	{ selectId: model => model._id, }
);

export const initialAccountTypeState: AccountTypeState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAccountTypeModel({}),
	lastCreatedAccountTypeId: undefined,
	showInitWaitingMessage: true
});

export function accountTypeReducer(state = initialAccountTypeState, action: AccountTypeActions): AccountTypeState {
	switch  (action.type) {
		case AccountTypeActionTypes.AccountTypePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAccountTypeId: undefined
		};
		case AccountTypeActionTypes.AccountTypeActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AccountTypeActionTypes.AccountTypeOnServerCreated: return {
			...state
		};
		case AccountTypeActionTypes.AccountTypeCreated: return adapter.addOne(action.payload.accountType, {
			...state, lastCreatedBlockId: action.payload.accountType._id
		});
		case AccountTypeActionTypes.AccountTypeUpdated: return adapter.updateOne(action.payload.partialAccountType, state);
		case AccountTypeActionTypes.AccountTypeDeleted: return adapter.removeOne(action.payload.id, state);
		case AccountTypeActionTypes.AccountTypePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAccountTypeModel({})
		};
		case AccountTypeActionTypes.AccountTypePageLoaded: {
			return adapter.addMany(action.payload.accountType, {
				...initialAccountTypeState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAccountTypeState = createFeatureSelector<AccountTypeState>('accountType');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
