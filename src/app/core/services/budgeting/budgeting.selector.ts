// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { BudgetingState } from './budgeting.reducer';
import { each } from 'lodash';
import { BudgetingModel } from './budgeting.model';


export const selectBudgetingState = createFeatureSelector<BudgetingState>('budgeting');

export const selectBudgetingById = (budgetingId: string) => createSelector(
	selectBudgetingState,
	budgetingState =>  budgetingState.entities[budgetingId]
);

export const selectBudgetingPageLoading = createSelector(
	selectBudgetingState,
	budgetingState => {
		return budgetingState.listLoading;
	}
);

export const selectBudgetingActionLoading = createSelector(
	selectBudgetingState,
	budgetingState => budgetingState.actionsloading
);

export const selectLastCreatedBudgetingId = createSelector(
	selectBudgetingState,
	budgetingState => budgetingState.lastCreatedBudgetingId
);

export const selectBudgetingPageLastQuery = createSelector(
	selectBudgetingState,
	budgetingState => budgetingState.lastQuery
);

export const selectBudgetingInStore = createSelector(
	selectBudgetingState,
	budgetingState => {
		const items: BudgetingModel[] = [];
		each(budgetingState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: BudgetingModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, budgetingState.totalCount, '');
	}
);

export const selectBudgetingShowInitWaitingMessage = createSelector(
	selectBudgetingState,
	budgetingState => budgetingState.showInitWaitingMessage
);

export const selectHasBudgetingInStore = createSelector(
	selectBudgetingState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
