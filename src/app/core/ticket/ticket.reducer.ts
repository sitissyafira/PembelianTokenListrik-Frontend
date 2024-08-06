// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { TicketActions, TicketActionTypes } from './ticket.action';
// CRUD

// Models
import { TicketModel } from './ticket.model';
import { QueryTicketModel } from './queryticket.model';

// tslint:disable-next-line:no-empty-interface
export interface TicketState extends EntityState<TicketModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedTicketId: string;
	lastQuery: QueryTicketModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<TicketModel> = createEntityAdapter<TicketModel>(
	{ selectId: model => model._id, }
);

export const initialTicketState: TicketState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryTicketModel({}),
	lastCreatedTicketId: undefined,
	showInitWaitingMessage: true
});

export function ticketReducer(state = initialTicketState, action: TicketActions): TicketState {
	switch (action.type) {
		case TicketActionTypes.TicketPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedTicketId: undefined
		};
		case TicketActionTypes.TicketActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case TicketActionTypes.TicketOnServerCreated: return {
			...state
		};
		case TicketActionTypes.TicketCreated: return adapter.addOne(action.payload.ticket, {
			...state, lastCreatedBlockId: action.payload.ticket._id
		});
		case TicketActionTypes.TicketUpdated: return adapter.updateOne(action.payload.partialTicket, state);
		case TicketActionTypes.TicketDeleted: return adapter.removeOne(action.payload.id, state);
		case TicketActionTypes.TicketPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryTicketModel({})
		};

		case TicketActionTypes.TicketPageLoaded: {
			return adapter.addMany(action.payload.ticket, {
				...initialTicketState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}

		default: return state;
	}
}

export const getTicketState = createFeatureSelector<TicketState>('ticket');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
