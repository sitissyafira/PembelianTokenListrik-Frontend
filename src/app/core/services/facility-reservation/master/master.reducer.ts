// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { MasterActions, MasterActionTypes } from './master.action';
// CRUD

// Models
import { MasterModel } from './master.model';
import { QueryMasterModel } from './querymaster.model';

// tslint:disable-next-line:no-empty-interface
export interface MasterState extends EntityState<MasterModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedMasterId: string;
	lastQuery: QueryMasterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<MasterModel> = createEntityAdapter<MasterModel>(
	{ selectId: model => model._id, }
);

export const initialMasterState: MasterState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryMasterModel({}),
	lastCreatedMasterId: undefined,
	showInitWaitingMessage: true
});

export function masterReducer(state = initialMasterState, action: MasterActions): MasterState {
	switch (action.type) {
		case MasterActionTypes.MasterPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedMasterId: undefined
		};
		case MasterActionTypes.MasterActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case MasterActionTypes.MasterOnServerCreated: return {
			...state
		};
		case MasterActionTypes.MasterCreated: return adapter.addOne(action.payload.master, {
			...state, lastCreatedBlockId: action.payload.master._id
		});
		case MasterActionTypes.MasterUpdated: return adapter.updateOne(action.payload.partialMaster, state);
		case MasterActionTypes.MasterDeleted: return adapter.removeOne(action.payload.id, state);
		case MasterActionTypes.MasterPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryMasterModel({})
		};
		case MasterActionTypes.MasterPageLoaded: {
			return adapter.addMany(action.payload.master, {
				...initialMasterState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getMasterState = createFeatureSelector<MasterState>('master');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
