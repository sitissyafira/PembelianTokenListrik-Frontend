// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { DebitNoteActions, DebitNoteActionTypes } from './debitNote.action';
// CRUD

// Models
import { DebitNoteModel } from './debitNote.model';
import { QueryDebitNoteModel } from './querydebitNote.model';

// tslint:disable-next-line:no-empty-interface
export interface DebitNoteState extends EntityState<DebitNoteModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDebitNoteId: string;
	lastQuery: QueryDebitNoteModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DebitNoteModel> = createEntityAdapter<DebitNoteModel>(
	{ selectId: model => model._id, }
);

export const initialDebitNoteState: DebitNoteState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryDebitNoteModel({}),
	lastCreatedDebitNoteId: undefined,
	showInitWaitingMessage: true
});

export function debitNoteReducer(state = initialDebitNoteState, action: DebitNoteActions): DebitNoteState {
	switch (action.type) {
		case DebitNoteActionTypes.DebitNotePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDebitNoteId: undefined
		};
		case DebitNoteActionTypes.DebitNoteActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DebitNoteActionTypes.DebitNoteOnServerCreated: return {
			...state
		};
		case DebitNoteActionTypes.DebitNoteCreated: return adapter.addOne(action.payload.debitNote, {
			...state, lastCreatedBlockId: action.payload.debitNote._id
		});
		case DebitNoteActionTypes.DebitNoteUpdated: return adapter.updateOne(action.payload.pdebitNotetialDebitNote, state);
		case DebitNoteActionTypes.DebitNoteDeleted: return adapter.removeOne(action.payload.id, state);
		case DebitNoteActionTypes.DebitNotePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDebitNoteModel({})
		};
		case DebitNoteActionTypes.DebitNotePageLoaded: {
			return adapter.addMany(action.payload.debitNote, {
				...initialDebitNoteState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getDebitNoteState = createFeatureSelector<DebitNoteState>('debitNote');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
