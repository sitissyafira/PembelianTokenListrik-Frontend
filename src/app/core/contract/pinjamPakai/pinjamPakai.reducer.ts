// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PinjamPakaiActions, PinjamPakaiActionTypes } from './pinjamPakai.action';
// CRUD

// Models
import { PinjamPakaiModel } from './pinjamPakai.model';
import { QueryPinjamPakaiModel } from './querypinjamPakai.model';

// tslint:disable-next-line:no-empty-interface
export interface PinjamPakaiState extends EntityState<PinjamPakaiModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPinjamPakaiId: string;
	lastQuery: QueryPinjamPakaiModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PinjamPakaiModel> = createEntityAdapter<PinjamPakaiModel>(
	{ selectId: model => model._id, }
);

export const initialPinjamPakaiState: PinjamPakaiState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPinjamPakaiModel({}),
	lastCreatedPinjamPakaiId: undefined,
	showInitWaitingMessage: true
});

export function pinjamPakaiReducer(state = initialPinjamPakaiState, action: PinjamPakaiActions): PinjamPakaiState {
	switch  (action.type) {
		case PinjamPakaiActionTypes.PinjamPakaiPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPinjamPakaiId: undefined
		};
		case PinjamPakaiActionTypes.PinjamPakaiActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PinjamPakaiActionTypes.PinjamPakaiOnServerCreated: return {
			...state
		};
		case PinjamPakaiActionTypes.PinjamPakaiCreated: return adapter.addOne(action.payload.pinjamPakai, {
			...state, lastCreatedBlockId: action.payload.pinjamPakai._id
		});
		case PinjamPakaiActionTypes.PinjamPakaiUpdated: return adapter.updateOne(action.payload.partialPinjamPakai, state);
		case PinjamPakaiActionTypes.PinjamPakaiDeleted: return adapter.removeOne(action.payload.id, state);
		case PinjamPakaiActionTypes.PinjamPakaiPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPinjamPakaiModel({})
		};
		case PinjamPakaiActionTypes.PinjamPakaiPageLoaded: {
			return adapter.addMany(action.payload.pinjamPakai, {
				...initialPinjamPakaiState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPinjamPakaiState = createFeatureSelector<PinjamPakaiState>('pinjamPakai');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
