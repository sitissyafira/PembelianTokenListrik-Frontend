
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { InternalUserActions, InternalUserActionTypes } from './internalUser.action';

import { InternalUserModel } from './internalUser.model';
import { QueryInternalUserModel } from './queryinternalUser.model';

export interface InternalUserState extends EntityState<InternalUserModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedInternalUserId: string;
	lastQuery: QueryInternalUserModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<InternalUserModel> = createEntityAdapter<InternalUserModel>(
	{ selectId: model => model._id, }
);

export const initialInternalUserState: InternalUserState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryInternalUserModel({}),
	lastCreatedInternalUserId: undefined,
	showInitWaitingMessage: true
});

export function internalUserReducer(state = initialInternalUserState, action: InternalUserActions): InternalUserState {
	switch  (action.type) {
		case InternalUserActionTypes.InternalUserPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedInternalUserId: undefined
		};
		case InternalUserActionTypes.InternalUserActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case InternalUserActionTypes.InternalUserOnServerCreated: return {
			...state
		};
		case InternalUserActionTypes.InternalUserCreated: return adapter.addOne(action.payload.internalUser, {
			...state, lastCreatedBlockId: action.payload.internalUser._id
		});
		case InternalUserActionTypes.InternalUserUpdated: return adapter.updateOne(action.payload.partialInternalUser, state);
		case InternalUserActionTypes.InternalUserDeleted: return adapter.removeOne(action.payload.id, state);
		case InternalUserActionTypes.InternalUserPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryInternalUserModel({})
		};
		case InternalUserActionTypes.InternalUserPageLoaded: {
			return adapter.addMany(action.payload.internalUser, {
				...initialInternalUserState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getInternalUserState = createFeatureSelector<InternalUserState>('internalUser');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
