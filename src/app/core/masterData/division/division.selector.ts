import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { DivisionState } from './division.reducer';
import { each } from 'lodash';
import { DivisionModel } from './division.model';


export const selectDivisionState = createFeatureSelector<DivisionState>('division');

export const selectDivisionById = (divisionId: string) => createSelector(
	selectDivisionState,
	divisionState =>  divisionState.entities[divisionId]
);
export const selectDivisionPageLoading = createSelector(
	selectDivisionState,
	divisionState => {
		return divisionState.listLoading;
	}
);
export const selectDivisionActionLoading = createSelector(
	selectDivisionState,
	divisionState => divisionState.actionsloading
);
export const selectLastCreatedDivisionId = createSelector(
	selectDivisionState,
	divisionState => divisionState.lastCreatedDivisionId
);
export const selectDivisionPageLastQuery = createSelector(
	selectDivisionState,
	divisionState => divisionState.lastQuery
);
export const selectDivisionInStore = createSelector(
	selectDivisionState,
	divisionState => {
		const items: DivisionModel[] = [];
		each(divisionState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: DivisionModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, divisionState.totalCount, '');
	}
);
export const selectDivisionShowInitWaitingMessage = createSelector(
	selectDivisionState,
	divisionState => divisionState.showInitWaitingMessage
);
export const selectHasDivisionInStore = createSelector(
	selectDivisionState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
