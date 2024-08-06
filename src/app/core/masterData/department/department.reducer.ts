
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { DepartmentActions, DepartmentActionTypes } from './department.action';
import { DepartmentModel } from './department.model';
import { QueryDepartmentModel } from './querydepartment.model';

export interface DepartmentState extends EntityState<DepartmentModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDepartmentId: string;
	lastQuery: QueryDepartmentModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<DepartmentModel> = createEntityAdapter<DepartmentModel>(
	{ selectId: model => model._id, }
);
export const initialDepartmentState: DepartmentState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryDepartmentModel({}),
	lastCreatedDepartmentId: undefined,
	showInitWaitingMessage: true
});
export function departmentReducer(state = initialDepartmentState, action: DepartmentActions): DepartmentState {
	switch  (action.type) {
		case DepartmentActionTypes.DepartmentPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDepartmentId: undefined
		};
		case DepartmentActionTypes.DepartmentActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DepartmentActionTypes.DepartmentOnServerCreated: return {
			...state
		};
		case DepartmentActionTypes.DepartmentCreated: return adapter.addOne(action.payload.department, {
			...state, lastCreatedBlockId: action.payload.department._id
		});
		case DepartmentActionTypes.DepartmentUpdated: return adapter.updateOne(action.payload.partialDepartment, state);
		case DepartmentActionTypes.DepartmentDeleted: return adapter.removeOne(action.payload.id, state);
		case DepartmentActionTypes.DepartmentPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDepartmentModel({})
		};
		case DepartmentActionTypes.DepartmentPageLoaded: {
			return adapter.addMany(action.payload.department, {
				...initialDepartmentState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getDepartmentState = createFeatureSelector<DepartmentState>('department');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
