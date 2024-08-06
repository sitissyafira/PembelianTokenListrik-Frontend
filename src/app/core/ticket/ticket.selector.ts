// NGRX
import { createFeatureSelector, createSelector } from '@ngrx/store';
// CRUD
import { QueryResultsModel, HttpExtenstionsModel } from '../_base/crud';
// State
import { TicketState } from './ticket.reducer';
import { each } from 'lodash';
import { TicketModel } from './ticket.model';


export const selectTicketState = createFeatureSelector<TicketState>('ticket');

export const selectTicketById = (ticketId: string) => createSelector(
	selectTicketState,
	ticketState => ticketState.entities[ticketId]
);

export const selectTicketPageLoading = createSelector(
	selectTicketState,
	ticketState => {
		return ticketState.listLoading;
	}
);

export const selectTicketActionLoading = createSelector(
	selectTicketState,
	ticketState => ticketState.actionsloading
);

export const selectLastCreatedTicketId = createSelector(
	selectTicketState,
	ticketState => ticketState.lastCreatedTicketId
);

export const selectTicketPageLastQuery = createSelector(
	selectTicketState,
	ticketState => ticketState.lastQuery
);

export const selectTicketInStore = createSelector(
	selectTicketState,
	ticketState => {
		const items: TicketModel[] = [];
		each(ticketState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: TicketModel[] = httpExtension.sortArray(items, ticketState.lastQuery.sortField, ticketState.lastQuery.sortOrder);
		return new QueryResultsModel(result, ticketState.totalCount, '');
	}
);

export const selectTicketShowInitWaitingMessage = createSelector(
	selectTicketState,
	ticketState => ticketState.showInitWaitingMessage
);

export const selectHasTicketInStore = createSelector(
	selectTicketState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}

		return true;
	}
);
