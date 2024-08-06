import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { LogFinanceState } from './logFinance.reducer';
import { each } from 'lodash';
import { LogFinanceModel } from './logFinance.model';


export const selectLogFinanceState = createFeatureSelector<LogFinanceState>('logFinance');

export const selectLogFinanceById = (logFinanceId: string) => createSelector(
	selectLogFinanceState,
	logFinanceState =>  logFinanceState.entities[logFinanceId]
);

export const selectLogFinancePageLoading = createSelector(
	selectLogFinanceState,
	logFinanceState => {
		return logFinanceState.listLoading;
	}
);

export const selectLogFinanceActionLoading = createSelector(
	selectLogFinanceState,
	logFinanceState => logFinanceState.actionsloading
);

export const selectLastCreatedLogFinanceId = createSelector(
	selectLogFinanceState,
	logFinanceState => logFinanceState.lastCreatedLogFinanceId
);

export const selectLogFinancePageLastQuery = createSelector(
	selectLogFinanceState,
	logFinanceState => logFinanceState.lastQuery
);

export const selectLogFinanceInStore = createSelector(
	selectLogFinanceState,
	logFinanceState => {
		const items: LogFinanceModel[] = [];
		each(logFinanceState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: LogFinanceModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, logFinanceState.totalCount, '');
	}
);

export const selectLogFinanceShowInitWaitingMessage = createSelector(
	selectLogFinanceState,
	logFinanceState => logFinanceState.showInitWaitingMessage
);

export const selectHasLogFinanceInStore = createSelector(
	selectLogFinanceState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
