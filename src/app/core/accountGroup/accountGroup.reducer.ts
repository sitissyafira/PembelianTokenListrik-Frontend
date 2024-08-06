// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AccountGroupActions, AccountGroupActionTypes } from './accountGroup.action';
// CRUD

// Models
import { AccountGroupModel } from './accountGroup.model';
import { QueryAccountGroupModel } from './queryag.model';

// tslint:disable-next-line:no-empty-interface
export interface AccountGroupState extends EntityState<AccountGroupModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAccountGroupId: string;
	lastQuery: QueryAccountGroupModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AccountGroupModel> = createEntityAdapter<AccountGroupModel>(
	{ selectId: model => model._id, }
);

export const initialAccountGroupState: AccountGroupState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAccountGroupModel({}),
	lastCreatedAccountGroupId: undefined,
	showInitWaitingMessage: true
});

export function accountGroupReducer(state = initialAccountGroupState, action: AccountGroupActions): AccountGroupState {
	switch  (action.type) {
		case AccountGroupActionTypes.AccountGroupPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAccountGroupId: undefined
		};
		case AccountGroupActionTypes.AccountGroupActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AccountGroupActionTypes.AccountGroupOnServerCreated: return {
			...state
		};
		case AccountGroupActionTypes.AccountGroupCreated: return adapter.addOne(action.payload.accountGroup, {
			...state, lastCreatedBlockId: action.payload.accountGroup._id
		});
		case AccountGroupActionTypes.AccountGroupUpdated: return adapter.updateOne(action.payload.partialAccountGroup, state);
		case AccountGroupActionTypes.AccountGroupDeleted: return adapter.removeOne(action.payload.id, state);
		case AccountGroupActionTypes.AccountGroupPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAccountGroupModel({})
		};
		case AccountGroupActionTypes.AccountGroupPageLoaded: {
			return adapter.addMany(action.payload.accountGroup, {
				...initialAccountGroupState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAccountGroupState = createFeatureSelector<AccountGroupState>('accountGroup');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
