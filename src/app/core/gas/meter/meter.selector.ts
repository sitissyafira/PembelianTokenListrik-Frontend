// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
// State
import { GasMeterState } from './meter.reducer';
import { each } from 'lodash';
import { GasMeterModel } from './meter.model';


export const selectGasMeterState = createFeatureSelector<GasMeterState>('gasMeter');

export const selectGasMeterById = (gasMeterId: string) => createSelector(
	selectGasMeterState,
	gasMeterState =>  gasMeterState.entities[gasMeterId]
);

export const selectGasMeterPageLoading = createSelector(
	selectGasMeterState,
	gasMeterState => {
		return gasMeterState.listLoading;
	}
);

export const selectGasMeterActionLoading = createSelector(
	selectGasMeterState,
	gasMeterState => gasMeterState.actionsloading
);

export const selectLastCreatedGasMeterId = createSelector(
	selectGasMeterState,
	gasMeterState => gasMeterState.lastCreatedGasMeterId
);

export const selectGasMeterPageLastQuery = createSelector(
	selectGasMeterState,
	gasMeterState => gasMeterState.lastQuery
);

export const selectGasMeterInStore = createSelector(
	selectGasMeterState,
	gasMeterState => {
		const items: GasMeterModel[] = [];
		each(gasMeterState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: GasMeterModel[] = httpExtension.sortArray(items, gasMeterState.lastQuery.sortField, gasMeterState.lastQuery.sortOrder);
		return new QueryResultsModel(result, gasMeterState.totalCount, '');
	}
);

export const selectGasMeterShowInitWaitingMessage = createSelector(
	selectGasMeterState,
	gasMeterState => gasMeterState.showInitWaitingMessage
);

export const selectHasGasMeterInStore = createSelector(
	selectGasMeterState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
