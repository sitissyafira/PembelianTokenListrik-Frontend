// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { billingNotifActions, billingNotifActionTypes } from './billingNotif.action';
// CRUD

// Models
import { billingNotifModel } from './billingNotif.model';
import { QuerybillingNotifModel } from './queryag.model';

// tslint:disable-next-line:no-empty-interface
export interface billingNotifState extends EntityState<billingNotifModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedbillingNotifId: string;
	lastQuery: QuerybillingNotifModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<billingNotifModel> = createEntityAdapter<billingNotifModel>(
	{ selectId: model => model._id, }
);

export const initialbillingNotifState: billingNotifState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QuerybillingNotifModel(null,null,null),
	lastCreatedbillingNotifId: undefined,
	showInitWaitingMessage: true
});

export function billingNotifReducer(state = initialbillingNotifState, action: billingNotifActions): billingNotifState {
	switch  (action.type) {
		case billingNotifActionTypes.billingNotifPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedbillingNotifId: undefined
		};
		case billingNotifActionTypes.billingNotifActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case billingNotifActionTypes.billingNotifOnServerCreated: return {
			...state
		};
		case billingNotifActionTypes.billingNotifCreated: return adapter.addOne(action.payload.billingNotif, {
			...state, lastCreatedBlockId: action.payload.billingNotif._id
		});
		case billingNotifActionTypes.billingNotifUpdated: return adapter.updateOne(action.payload.partialbillingNotif, state);
		case billingNotifActionTypes.billingNotifDeleted: return adapter.removeOne(action.payload.id, state);
		case billingNotifActionTypes.billingNotifPageCancelled: return {
			...state, listLoading: false, lastQuery: new QuerybillingNotifModel(null,null,null)
		};
		case billingNotifActionTypes.billingNotifPageLoaded: {
			return adapter.addMany(action.payload.billingNotif, {
				...initialbillingNotifState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getbillingNotifState = createFeatureSelector<billingNotifState>('billingNotif');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
