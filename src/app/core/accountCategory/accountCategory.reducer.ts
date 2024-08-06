// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AccountCategoryActions, AccountCategoryActionTypes } from './accountCategory.action';
// CRUD

// Models
import { AccountCategoryModel } from './accountCategory.model';
import { QueryAccountCategoryModel } from './queryaccountcategory.model';

// tslint:disable-next-line:no-empty-interface
export interface AccountCategoryState extends EntityState<AccountCategoryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAccountCategoryId: string;
	lastQuery: QueryAccountCategoryModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AccountCategoryModel> = createEntityAdapter<AccountCategoryModel>(
	{ selectId: model => model._id, }
);

export const initialAccountCategoryState: AccountCategoryState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAccountCategoryModel({}),
	lastCreatedAccountCategoryId: undefined,
	showInitWaitingMessage: true
});

export function accountCategoryReducer(state = initialAccountCategoryState, action: AccountCategoryActions): AccountCategoryState {
	switch  (action.type) {
		case AccountCategoryActionTypes.AccountCategoryPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAccountCategoryId: undefined
		};
		case AccountCategoryActionTypes.AccountCategoryActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AccountCategoryActionTypes.AccountCategoryOnServerCreated: return {
			...state
		};
		case AccountCategoryActionTypes.AccountCategoryCreated: return adapter.addOne(action.payload.accountCategory, {
			...state, lastCreatedBlockId: action.payload.accountCategory._id
		});
		case AccountCategoryActionTypes.AccountCategoryUpdated: return adapter.updateOne(action.payload.partialAccountCategory, state);
		case AccountCategoryActionTypes.AccountCategoryDeleted: return adapter.removeOne(action.payload.id, state);
		case AccountCategoryActionTypes.AccountCategoryPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAccountCategoryModel({})
		};
		case AccountCategoryActionTypes.AccountCategoryPageLoaded: {
			return adapter.addMany(action.payload.accountCategory, {
				...initialAccountCategoryState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAccountCategoryState = createFeatureSelector<AccountCategoryState>('accountCategory');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
