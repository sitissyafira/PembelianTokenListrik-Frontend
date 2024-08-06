
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ExternalUserActions, ExternalUserActionTypes } from './externalUser.action';

import { ExternalUserModel } from './externalUser.model';
import { QueryExternalUserModel } from './queryexternalUser.model';

export interface ExternalUserState extends EntityState<ExternalUserModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedExternalUserId: string;
	lastQuery: QueryExternalUserModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ExternalUserModel> = createEntityAdapter<ExternalUserModel>(
	{ selectId: model => model._id, }
);

export const initialExternalUserState: ExternalUserState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryExternalUserModel({}),
	lastCreatedExternalUserId: undefined,
	showInitWaitingMessage: true
});

export function externalUserReducer(state = initialExternalUserState, action: ExternalUserActions): ExternalUserState {
	switch  (action.type) {
		case ExternalUserActionTypes.ExternalUserPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedExternalUserId: undefined
		};
		case ExternalUserActionTypes.ExternalUserActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ExternalUserActionTypes.ExternalUserOnServerCreated: return {
			...state
		};
		case ExternalUserActionTypes.ExternalUserCreated: return adapter.addOne(action.payload.externalUser, {
			...state, lastCreatedBlockId: action.payload.externalUser._id
		});
		case ExternalUserActionTypes.ExternalUserUpdated: return adapter.updateOne(action.payload.partialExternalUser, state);
		case ExternalUserActionTypes.ExternalUserDeleted: return adapter.removeOne(action.payload.id, state);
		case ExternalUserActionTypes.ExternalUserPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryExternalUserModel({})
		};
		case ExternalUserActionTypes.ExternalUserPageLoaded: {
			return adapter.addMany(action.payload.externalUser, {
				...initialExternalUserState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getExternalUserState = createFeatureSelector<ExternalUserState>('externalUser');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
