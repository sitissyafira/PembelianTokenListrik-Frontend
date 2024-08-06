// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { WriteOffActions, WriteOffActionTypes } from './writeOff.action';
// CRUD

// Models
import { WriteOffModel } from './writeOff.model';
import { QueryWriteOffModel } from './querywriteOff.model';

// tslint:disable-next-line:no-empty-interface
export interface WriteOffState extends EntityState<WriteOffModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedWriteOffId: string;
	lastQuery: QueryWriteOffModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<WriteOffModel> = createEntityAdapter<WriteOffModel>(
	{ selectId: model => model._id, }
);

export const initialWriteOffState: WriteOffState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryWriteOffModel({}),
	lastCreatedWriteOffId: undefined,
	showInitWaitingMessage: true
});

export function writeOffReducer(state = initialWriteOffState, action: WriteOffActions): WriteOffState {
	switch (action.type) {
		case WriteOffActionTypes.WriteOffPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedWriteOffId: undefined
		};
		case WriteOffActionTypes.WriteOffActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case WriteOffActionTypes.WriteOffOnServerCreated: return {
			...state
		};
		case WriteOffActionTypes.WriteOffCreated: return adapter.addOne(action.payload.writeOff, {
			...state, lastCreatedBlockId: action.payload.writeOff._id
		});
		case WriteOffActionTypes.WriteOffUpdated: return adapter.updateOne(action.payload.pwriteOfftialWriteOff, state);
		case WriteOffActionTypes.WriteOffDeleted: return adapter.removeOne(action.payload.id, state);
		case WriteOffActionTypes.WriteOffPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryWriteOffModel({})
		};
		case WriteOffActionTypes.WriteOffPageLoaded: {
			return adapter.addMany(action.payload.writeOff, {
				...initialWriteOffState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getWriteOffState = createFeatureSelector<WriteOffState>('writeOff');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
