// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PrkbillingActions, PrkbillingActionTypes } from './prkbilling.action';
// CRUD

// Models
import { PrkbillingModel } from './prkbilling.model';
import { QueryPrkbillingModel } from './queryprkbilling.model';

// tslint:disable-next-line:no-empty-interface
export interface PrkbillingState extends EntityState<PrkbillingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPrkbillingId: string;
	lastQuery: QueryPrkbillingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PrkbillingModel> = createEntityAdapter<PrkbillingModel>(
	{ selectId: model => model._id, }
);

export const initialPrkbillingState: PrkbillingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPrkbillingModel({}),
	lastCreatedPrkbillingId: undefined,
	showInitWaitingMessage: true
});

export function prkbillingReducer(state = initialPrkbillingState, action: PrkbillingActions): PrkbillingState {
	switch  (action.type) {
		case PrkbillingActionTypes.PrkbillingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPrkbillingId: undefined
		};
		case PrkbillingActionTypes.PrkbillingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PrkbillingActionTypes.PrkbillingOnServerCreated: return {
			...state
		};
		case PrkbillingActionTypes.PrkbillingCreated: return adapter.addOne(action.payload.prkbilling, {
			...state, lastCreatedBlockId: action.payload.prkbilling._id
		});
		case PrkbillingActionTypes.PrkbillingUpdated: return adapter.updateOne(action.payload.partialPrkbilling, state);
		case PrkbillingActionTypes.PrkbillingDeleted: return adapter.removeOne(action.payload.id, state);
		case PrkbillingActionTypes.PrkbillingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPrkbillingModel({})
		};
		case PrkbillingActionTypes.PrkbillingPageLoaded: {
			return adapter.addMany(action.payload.prkbilling, {
				...initialPrkbillingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPrkbillingState = createFeatureSelector<PrkbillingState>('prkbilling');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
