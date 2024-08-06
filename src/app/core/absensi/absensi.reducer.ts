
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { AbsensiActions, AbsensiActionTypes } from './absensi.action';

import { AbsensiModel } from './absensi.model';
import { QueryAbsensiModel } from './queryabsensi.model';

export interface AbsensiState extends EntityState<AbsensiModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAbsensiId: string;
	lastQuery: QueryAbsensiModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AbsensiModel> = createEntityAdapter<AbsensiModel>(
	{ selectId: model => model._id, }
);

export const initialAbsensiState: AbsensiState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAbsensiModel({}),
	lastCreatedAbsensiId: undefined,
	showInitWaitingMessage: true
});

export function absensiReducer(state = initialAbsensiState, action: AbsensiActions): AbsensiState {
	switch  (action.type) {
		case AbsensiActionTypes.AbsensiPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAbsensiId: undefined
		};
		case AbsensiActionTypes.AbsensiActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AbsensiActionTypes.AbsensiOnServerCreated: return {
			...state
		};
		case AbsensiActionTypes.AbsensiCreated: return adapter.addOne(action.payload.absensi, {
			...state, lastCreatedBlockId: action.payload.absensi._id
		});
		case AbsensiActionTypes.AbsensiUpdated: return adapter.updateOne(action.payload.partialAbsensi, state);
		case AbsensiActionTypes.AbsensiDeleted: return adapter.removeOne(action.payload.id, state);
		case AbsensiActionTypes.AbsensiPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAbsensiModel({})
		};
		case AbsensiActionTypes.AbsensiPageLoaded: {
			return adapter.addMany(action.payload.absensi, {
				...initialAbsensiState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAbsensiState = createFeatureSelector<AbsensiState>('absensi');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
