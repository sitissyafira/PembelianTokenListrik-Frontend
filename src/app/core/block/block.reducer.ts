// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { BlockActions, BlockActionTypes } from './block.action';
// CRUD
import { QueryBlockModel } from './queryblock.model';
// Models
import { BlockModel } from './block.model';

// tslint:disable-next-line:no-empty-interface
export interface BlockState extends EntityState<BlockModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedBlockId: string;
	lastQuery: QueryBlockModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<BlockModel> = createEntityAdapter<BlockModel>(
	{ selectId: model => model._id, }
);

export const initialBlockState: BlockState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryBlockModel({}),
	lastCreatedBlockId: undefined,
	showInitWaitingMessage: true
});

export function blockReducer(state = initialBlockState, action: BlockActions): BlockState {
	switch  (action.type) {
		case BlockActionTypes.BlockPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedBlockId: undefined
		};
		case BlockActionTypes.BlockActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case BlockActionTypes.BlockOnServerCreated: return {
			...state
		};
		case BlockActionTypes.BlockCreated: return adapter.addOne(action.payload.block, {
			...state, lastCreatedBlockId: action.payload.block._id
		});
		case BlockActionTypes.BlockUpdated: return adapter.updateOne(action.payload.partialBlock, state);
		case BlockActionTypes.BlockDeleted: return adapter.removeOne(action.payload.id, state);
		case BlockActionTypes.BlockPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryBlockModel({})
		};
		case BlockActionTypes.BlockPageLoaded: {
			return adapter.addMany(action.payload.block, {
				...initialBlockState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getBlockState = createFeatureSelector<BlockState>('block');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
