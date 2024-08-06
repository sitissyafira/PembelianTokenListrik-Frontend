// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { CategoryActions, CategoryActionTypes } from './category.action';
// CRUD

// Models
import { CategoryModel } from './category.model';
import { QueryCategoryModel } from './querycategory.model';

// tslint:disable-next-line:no-empty-interface
export interface CategoryState extends EntityState<CategoryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedCategoryId: string;
	lastQuery: QueryCategoryModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<CategoryModel> = createEntityAdapter<CategoryModel>(
	{ selectId: model => model._id, }
);

export const initialCategoryState: CategoryState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryCategoryModel({}),
	lastCreatedCategoryId: undefined,
	showInitWaitingMessage: true
});

export function categoryReducer(state = initialCategoryState, action: CategoryActions): CategoryState {
	switch  (action.type) {
		case CategoryActionTypes.CategoryPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedCategoryId: undefined
		};
		case CategoryActionTypes.CategoryActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case CategoryActionTypes.CategoryOnServerCreated: return {
			...state
		};
		case CategoryActionTypes.CategoryCreated: return adapter.addOne(action.payload.category, {
			...state, lastCreatedBlockId: action.payload.category._id
		});
		case CategoryActionTypes.CategoryUpdated: return adapter.updateOne(action.payload.partialCategory, state);
		case CategoryActionTypes.CategoryDeleted: return adapter.removeOne(action.payload.id, state);
		case CategoryActionTypes.CategoryPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryCategoryModel({})
		};
		case CategoryActionTypes.CategoryPageLoaded: {
			return adapter.addMany(action.payload.category, {
				...initialCategoryState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getCategoryState = createFeatureSelector<CategoryState>('category');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
