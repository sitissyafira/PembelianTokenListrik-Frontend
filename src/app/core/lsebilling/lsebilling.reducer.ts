// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { LsebillingActions, LsebillingActionTypes } from './lsebilling.action';
// CRUD

// Models
import { LsebillingModel } from './lsebilling.model';
import { QueryLsebillingModel } from './querylsebilling.model';

// tslint:disable-next-line:no-empty-interface
export interface LsebillingState extends EntityState<LsebillingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedLsebillingId: string;
	lastQuery: QueryLsebillingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<LsebillingModel> = createEntityAdapter<LsebillingModel>(
	{ selectId: model => model._id, }
);

export const initialLsebillingState: LsebillingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryLsebillingModel({}),
	lastCreatedLsebillingId: undefined,
	showInitWaitingMessage: true
});

export function lsebillingReducer(state = initialLsebillingState, action: LsebillingActions): LsebillingState {
	switch  (action.type) {
		case LsebillingActionTypes.LsebillingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedLsebillingId: undefined
		};
		case LsebillingActionTypes.LsebillingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case LsebillingActionTypes.LsebillingOnServerCreated: return {
			...state
		};
		case LsebillingActionTypes.LsebillingCreated: return adapter.addOne(action.payload.lsebilling, {
			...state, lastCreatedBlockId: action.payload.lsebilling._id
		});
		case LsebillingActionTypes.LsebillingUpdated: return adapter.updateOne(action.payload.partialLsebilling, state);
		case LsebillingActionTypes.LsebillingDeleted: return adapter.removeOne(action.payload.id, state);
		case LsebillingActionTypes.LsebillingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryLsebillingModel({})
		};
		case LsebillingActionTypes.LsebillingPageLoaded: {
			return adapter.addMany(action.payload.lsebilling, {
				...initialLsebillingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getLsebillingState = createFeatureSelector<LsebillingState>('lsebilling');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
