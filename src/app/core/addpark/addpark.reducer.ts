// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AddparkActions, AddparkActionTypes } from './addpark.action';
// CRUD

// Models
import { AddparkModel } from './addpark.model';
import { QueryAddparkModel } from './queryaddpark.model';

// tslint:disable-next-line:no-empty-interface
export interface AddparkState extends EntityState<AddparkModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAddparkId: string;
	lastQuery: QueryAddparkModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AddparkModel> = createEntityAdapter<AddparkModel>(
	{ selectId: model => model._id, }
);

export const initialAddparkState: AddparkState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryAddparkModel({}),
	lastCreatedAddparkId: undefined,
	showInitWaitingMessage: true
});

export function addparkReducer(state = initialAddparkState, action: AddparkActions): AddparkState {
	switch  (action.type) {
		case AddparkActionTypes.AddparkPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAddparkId: undefined
		};
		case AddparkActionTypes.AddparkActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AddparkActionTypes.AddparkOnServerCreated: return {
			...state
		};
		case AddparkActionTypes.AddparkCreated: return adapter.addOne(action.payload.addpark, {
			...state, lastCreatedBlockId: action.payload.addpark._id
		});
		case AddparkActionTypes.AddparkUpdated: return adapter.updateOne(action.payload.partialAddpark, state);
		case AddparkActionTypes.AddparkDeleted: return adapter.removeOne(action.payload.id, state);
		case AddparkActionTypes.AddparkPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAddparkModel({})
		};
		case AddparkActionTypes.AddparkPageLoaded: {
			return adapter.addMany(action.payload.addpark, {
				...initialAddparkState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAddparkState = createFeatureSelector<AddparkState>('addpark');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
