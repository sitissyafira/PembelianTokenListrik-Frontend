// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { PublicTicketState } from './publicticket.reducer';
import { each } from 'lodash';
import { PublicTicketModel } from './publicticket.model';


export const selectPublicTicketState = createFeatureSelector<PublicTicketState>('publicTicket');

export const selectPublicTicketById = (publicTicketId: string) => createSelector(
	selectPublicTicketState,
	publicTicketState => publicTicketState.entities[publicTicketId]
);

export const selectPublicTicketPageLoading = createSelector(
	selectPublicTicketState,
	publicTicketState => {
		return publicTicketState.listLoading;
	}
);

export const selectPublicTicketActionLoading = createSelector(
	selectPublicTicketState,
	publicTicketState => publicTicketState.actionsloading
);

export const selectLastCreatedPublicTicketId = createSelector(
	selectPublicTicketState,
	publicTicketState => publicTicketState.lastCreatedPublicTicketId
);

export const selectPublicTicketPageLastQuery = createSelector(
	selectPublicTicketState,
	publicTicketState => publicTicketState.lastQuery
);

export const selectPublicTicketInStore = createSelector(
	selectPublicTicketState,
	publicTicketState => {
		const items: PublicTicketModel[] = [];
		each(publicTicketState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PublicTicketModel[] = httpExtension.sortArray(items, publicTicketState.lastQuery.sortField, publicTicketState.lastQuery.sortOrder);
		return new QueryResultsModel(result, publicTicketState.totalCount, '');
	}
);

export const selectPublicTicketShowInitWaitingMessage = createSelector(
	selectPublicTicketState,
	publicTicketState => publicTicketState.showInitWaitingMessage
);

export const selectHasPublicTicketInStore = createSelector(
	selectPublicTicketState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
