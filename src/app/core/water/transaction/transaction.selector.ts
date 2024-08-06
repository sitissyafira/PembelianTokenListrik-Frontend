// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModelUpd, HttpExtenstionsModelUpd } from '../../_base/crud-upd';
// State
import { WaterTransactionState } from './transaction.reducer';
import { each } from 'lodash';
import { WaterTransactionModel } from './transaction.model';


export const selectWaterTransactionState = createFeatureSelector<WaterTransactionState>('waterTransaction');

export const selectWaterTransactionById = (waterTransactionId: string) => createSelector(
	selectWaterTransactionState,
	waterTransactionState =>  waterTransactionState.entities[waterTransactionId]
);

export const selectWaterTransactionPageLoading = createSelector(
	selectWaterTransactionState,
	waterTransactionState => {
		return waterTransactionState.listLoading;
	}
);

export const selectWaterTransactionActionLoading = createSelector(
	selectWaterTransactionState,
	waterTransactionState => waterTransactionState.actionsloading
);

export const selectLastCreatedWaterTransactionId = createSelector(
	selectWaterTransactionState,
	waterTransactionState => waterTransactionState.lastCreatedWaterTransactionId
);

export const selectWaterTransactionPageLastQuery = createSelector(
	selectWaterTransactionState,
	waterTransactionState => waterTransactionState.lastQuery
);

export const selectWaterTransactionInStore = createSelector(
	selectWaterTransactionState,
	waterTransactionState => {
		const items: WaterTransactionModel[] = [];
		each(waterTransactionState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModelUpd();
		const result: WaterTransactionModel[] = httpExtension.sortArray(items, waterTransactionState.lastQuery.sortField, waterTransactionState.lastQuery.sortOrder);
		return new QueryResultsModelUpd(result,waterTransactionState.allTotalCount, waterTransactionState.totalCount, 0);
	}
);

export const selectWaterTransactionShowInitWaitingMessage = createSelector(
	selectWaterTransactionState,
	waterTransactionState => waterTransactionState.showInitWaitingMessage
);

export const selectHasWaterTransactionInStore = createSelector(
	selectWaterTransactionState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
