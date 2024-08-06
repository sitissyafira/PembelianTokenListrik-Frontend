import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { DepartmentState } from './department.reducer';
import { each } from 'lodash';
import { DepartmentModel } from './department.model';


export const selectDepartmentState = createFeatureSelector<DepartmentState>('department');

export const selectDepartmentById = (departmentId: string) => createSelector(
	selectDepartmentState,
	departmentState =>  departmentState.entities[departmentId]
);
export const selectDepartmentPageLoading = createSelector(
	selectDepartmentState,
	departmentState => {
		return departmentState.listLoading;
	}
);
export const selectDepartmentActionLoading = createSelector(
	selectDepartmentState,
	departmentState => departmentState.actionsloading
);
export const selectLastCreatedDepartmentId = createSelector(
	selectDepartmentState,
	departmentState => departmentState.lastCreatedDepartmentId
);
export const selectDepartmentPageLastQuery = createSelector(
	selectDepartmentState,
	departmentState => departmentState.lastQuery
);
export const selectDepartmentInStore = createSelector(
	selectDepartmentState,
	departmentState => {
		const items: DepartmentModel[] = [];
		each(departmentState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DepartmentModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, departmentState.totalCount, '');
	}
);
export const selectDepartmentShowInitWaitingMessage = createSelector(
	selectDepartmentState,
	departmentState => departmentState.showInitWaitingMessage
);
export const selectHasDepartmentInStore = createSelector(
	selectDepartmentState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
