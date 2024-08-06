
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { VndrCategoryActions, VndrCategoryActionTypes } from './vndrCategory.action';
import { VndrCategoryModel } from './vndrCategory.model';
import { QueryVndrCategoryModel } from './queryvndrCategory.model';

export interface VndrCategoryState extends EntityState<VndrCategoryModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedVndrCategoryId: string;
	lastQuery: QueryVndrCategoryModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<VndrCategoryModel> = createEntityAdapter<VndrCategoryModel>(
	{ selectId: model => model._id, }
);
export const initialVndrCategoryState: VndrCategoryState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryVndrCategoryModel({}),
	lastCreatedVndrCategoryId: undefined,
	showInitWaitingMessage: true
});
export function vndrCategoryReducer(state = initialVndrCategoryState, action: VndrCategoryActions): VndrCategoryState {
	switch  (action.type) {
		case VndrCategoryActionTypes.VndrCategoryPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVndrCategoryId: undefined
		};
		case VndrCategoryActionTypes.VndrCategoryActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VndrCategoryActionTypes.VndrCategoryOnServerCreated: return {
			...state
		};
		case VndrCategoryActionTypes.VndrCategoryCreated: return adapter.addOne(action.payload.vndrCategory, {
			...state, lastCreatedBlockId: action.payload.vndrCategory._id
		});
		case VndrCategoryActionTypes.VndrCategoryUpdated: return adapter.updateOne(action.payload.partialVndrCategory, state);
		case VndrCategoryActionTypes.VndrCategoryDeleted: return adapter.removeOne(action.payload.id, state);
		case VndrCategoryActionTypes.VndrCategoryPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryVndrCategoryModel({})
		};
		case VndrCategoryActionTypes.VndrCategoryPageLoaded: {
			return adapter.addMany(action.payload.vndrCategory, {
				...initialVndrCategoryState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getVndrCategoryState = createFeatureSelector<VndrCategoryState>('vndrCategory');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
