// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { BlockGroupActions, BlockGroupActionTypes } from './blockgroup.action';
// CRUD
import { QueryParamsModel } from '../_base/crud';
// Models
import { BlockgroupModel } from './blockgroup.model';

// tslint:disable-next-line:no-empty-interface
export interface BlockGroupState extends EntityState<BlockgroupModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBlockGroupId: string;
	lastQuery: QueryParamsModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BlockgroupModel> = createEntityAdapter<BlockgroupModel>(
	{ selectId: model => model._id, }
);

export const initialBlockGroupState: BlockGroupState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryParamsModel({}),
	lastCreatedBlockGroupId: undefined,
	showInitWaitingMessage: true
});

export function blockGroupReducer(state = initialBlockGroupState, action: BlockGroupActions): BlockGroupState {
	switch  (action.type) {
		case BlockGroupActionTypes.BlockGroupPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBlockGroupId: undefined
		};
		case BlockGroupActionTypes.BlockGroupActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BlockGroupActionTypes.BlockGroupOnServerCreated: return {
			...state
		};
		case BlockGroupActionTypes.BlockGroupCreated: return adapter.addOne(action.payload.blockgroup, {
			...state, lastCreatedUserId: action.payload.blockgroup._id
		});
		case BlockGroupActionTypes.BlockGroupUpdated: return adapter.updateOne(action.payload.partialBlockgroup, state);
		case BlockGroupActionTypes.BlockGroupDeleted: return adapter.removeOne(action.payload.id, state);
		case BlockGroupActionTypes.BlockGroupPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryParamsModel({})
		};
		case BlockGroupActionTypes.BlockGroupPageLoaded: {
			return adapter.addMany(action.payload.blockgroup, {
				...initialBlockGroupState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}

		case BlockGroupActionTypes.AllBlockGroupLoaded:{
			return adapter.addMany(action.payload.blockgroup, { ...initialBlockGroupState });
		}
		default: return state;
	}
}

export const getBlockGroupState = createFeatureSelector<BlockGroupState>('blockgroup');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
