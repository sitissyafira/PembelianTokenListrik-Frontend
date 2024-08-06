// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RoleActions, RoleActionTypes } from './role.action';
// CRUD

// Models
import { RoleModel } from './role.model';
import { QueryRoleModel } from './queryrole.model';

// tslint:disable-next-line:no-empty-interface
export interface RoleState extends EntityState<RoleModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRoleId: string;
	lastQuery: QueryRoleModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RoleModel> = createEntityAdapter<RoleModel>(
	{ selectId: model => model._id, }
);

export const initialRoleState: RoleState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRoleModel({}),
	lastCreatedRoleId: undefined,
	showInitWaitingMessage: true
});

export function roleReducer(state = initialRoleState, action: RoleActions): RoleState {
	switch  (action.type) {
		case RoleActionTypes.RolePageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRoleId: undefined
		};
		case RoleActionTypes.RoleActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RoleActionTypes.RoleOnServerCreated: return {
			...state
		};
		case RoleActionTypes.RoleCreated: return adapter.addOne(action.payload.role, {
			...state, lastCreatedBlockId: action.payload.role._id
		});
		case RoleActionTypes.RoleUpdated: return adapter.updateOne(action.payload.partialRole, state);
		case RoleActionTypes.RoleDeleted: return adapter.removeOne(action.payload.id, state);
		case RoleActionTypes.RolePageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRoleModel({})
		};
		case RoleActionTypes.RolePageLoaded: {
			return adapter.addMany(action.payload.role, {
				...initialRoleState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRoleState = createFeatureSelector<RoleState>('role');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
