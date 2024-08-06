// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../../_base/crud';
// State
import { SetOffState } from './setOff.reducer';
import { each } from 'lodash';
import { SetOffModel } from './setOff.model';


export const selectSetOffState = createFeatureSelector<SetOffState>('setOff');

export const selectSetOffById = (setOffId: string) => createSelector(
	selectSetOffState,
	setOffState => setOffState.entities[setOffId]
);

export const selectSetOffPageLoading = createSelector(
	selectSetOffState,
	setOffState => {
		return setOffState.listLoading;
	}
);

export const selectSetOffActionLoading = createSelector(
	selectSetOffState,
	setOffState => setOffState.actionsloading
);

export const selectLastCreatedSetOffId = createSelector(
	selectSetOffState,
	setOffState => setOffState.lastCreatedSetOffId
);

export const selectSetOffPageLastQuery = createSelector(
	selectSetOffState,
	setOffState => setOffState.lastQuery
);

export const selectSetOffInStore = createSelector(
	selectSetOffState,
	setOffState => {
		const items: SetOffModel[] = [];
		each(setOffState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: SetOffModel[] = httpExtension.sortArray(items, setOffState.lastQuery.sortField, setOffState.lastQuery.sortOrder);
		return new QueryResultsModel(result, setOffState.totalCount, '');
	}
);

export const selectSetOffShowInitWaitingMessage = createSelector(
	selectSetOffState,
	setOffState => setOffState.showInitWaitingMessage
);

export const selectHasSetOffInStore = createSelector(
	selectSetOffState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
