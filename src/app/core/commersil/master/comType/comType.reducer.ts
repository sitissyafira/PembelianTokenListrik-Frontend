
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ComTypeActions, ComTypeActionTypes } from './comType.action';
import { ComTypeModel } from './comType.model';
import { QueryComTypeModel } from './querycomType.model';

export interface ComTypeState extends EntityState<ComTypeModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedComTypeId: string;
	lastQuery: QueryComTypeModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<ComTypeModel> = createEntityAdapter<ComTypeModel>(
	{ selectId: model => model._id, }
);
export const initialComTypeState: ComTypeState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryComTypeModel({}),
	lastCreatedComTypeId: undefined,
	showInitWaitingMessage: true
});
export function comTypeReducer(state = initialComTypeState, action: ComTypeActions): ComTypeState {
	switch  (action.type) {
		case ComTypeActionTypes.ComTypePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedComTypeId: undefined
		};
		case ComTypeActionTypes.ComTypeActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ComTypeActionTypes.ComTypeOnServerCreated: return {
			...state
		};
		case ComTypeActionTypes.ComTypeCreated: return adapter.addOne(action.payload.comType, {
			...state, lastCreatedBlockId: action.payload.comType._id
		});
		case ComTypeActionTypes.ComTypeUpdated: return adapter.updateOne(action.payload.partialComType, state);
		case ComTypeActionTypes.ComTypeDeleted: return adapter.removeOne(action.payload.id, state);
		case ComTypeActionTypes.ComTypePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryComTypeModel({})
		};
		case ComTypeActionTypes.ComTypePageLoaded: {
			return adapter.addMany(action.payload.comType, {
				...initialComTypeState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getComTypeState = createFeatureSelector<ComTypeState>('comType');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
