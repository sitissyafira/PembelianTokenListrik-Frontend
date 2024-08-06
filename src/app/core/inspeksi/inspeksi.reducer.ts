
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { InspeksiActions, InspeksiActionTypes } from './inspeksi.action';

import { InspeksiModel } from './inspeksi.model';
import { QueryInspeksiModel } from './queryinspeksi.model';

export interface InspeksiState extends EntityState<InspeksiModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedInspeksiId: string;
	lastQuery: QueryInspeksiModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<InspeksiModel> = createEntityAdapter<InspeksiModel>(
	{ selectId: model => model._id, }
);

export const initialInspeksiState: InspeksiState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryInspeksiModel({}),
	lastCreatedInspeksiId: undefined,
	showInitWaitingMessage: true
});

export function inspeksiReducer(state = initialInspeksiState, action: InspeksiActions): InspeksiState {
	switch  (action.type) {
		case InspeksiActionTypes.InspeksiPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedInspeksiId: undefined
		};
		case InspeksiActionTypes.InspeksiActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case InspeksiActionTypes.InspeksiOnServerCreated: return {
			...state
		};
		case InspeksiActionTypes.InspeksiCreated: return adapter.addOne(action.payload.inspeksi, {
			...state, lastCreatedBlockId: action.payload.inspeksi._id
		});
		case InspeksiActionTypes.InspeksiUpdated: return adapter.updateOne(action.payload.partialInspeksi, state);
		case InspeksiActionTypes.InspeksiDeleted: return adapter.removeOne(action.payload.id, state);
		case InspeksiActionTypes.InspeksiPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryInspeksiModel({})
		};
		case InspeksiActionTypes.InspeksiPageLoaded: {
			return adapter.addMany(action.payload.inspeksi, {
				...initialInspeksiState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getInspeksiState = createFeatureSelector<InspeksiState>('inspeksi');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
