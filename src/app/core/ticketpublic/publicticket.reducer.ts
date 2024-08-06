// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PublicTicketActions, PublicTicketActionTypes } from './publicticket.action';
// CRUD

// Models
import { PublicTicketModel } from './publicticket.model';
import { QueryPublicTicketModel } from './querypublicticket.model';

// tslint:disable-next-line:no-empty-interface
export interface PublicTicketState extends EntityState<PublicTicketModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPublicTicketId: string;
	lastQuery: QueryPublicTicketModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PublicTicketModel> = createEntityAdapter<PublicTicketModel>(
	{ selectId: model => model._id, }
);

export const initialPublicTicketState: PublicTicketState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryPublicTicketModel({}),
	lastCreatedPublicTicketId: undefined,
	showInitWaitingMessage: true
});

export function publicTicketReducer(state = initialPublicTicketState, action: PublicTicketActions): PublicTicketState {
	switch (action.type) {
		case PublicTicketActionTypes.PublicTicketPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPublicTicketId: undefined
		};
		case PublicTicketActionTypes.PublicTicketActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PublicTicketActionTypes.PublicTicketOnServerCreated: return {
			...state
		};
		case PublicTicketActionTypes.PublicTicketCreated: return adapter.addOne(action.payload.publicTicket, {
			...state, lastCreatedBlockId: action.payload.publicTicket._id
		});
		case PublicTicketActionTypes.PublicTicketUpdated: return adapter.updateOne(action.payload.partialPublicTicket, state);
		case PublicTicketActionTypes.PublicTicketDeleted: return adapter.removeOne(action.payload.id, state);
		case PublicTicketActionTypes.PublicTicketPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPublicTicketModel({})
		};

		case PublicTicketActionTypes.PublicTicketPageLoaded: {
			return adapter.addMany(action.payload.publicTicket, {
				...initialPublicTicketState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}

		default: return state;
	}
}

export const getPublicTicketState = createFeatureSelector<PublicTicketState>('publicTicket');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
