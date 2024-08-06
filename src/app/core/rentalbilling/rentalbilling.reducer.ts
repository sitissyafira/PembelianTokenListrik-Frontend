// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RentalbillingActions, RentalbillingActionTypes } from './rentalbilling.action';
// CRUD

// Models
import { RentalbillingModel } from './rentalbilling.model';
import { QueryRentalbillingModel } from './queryrentalbilling.model';

// tslint:disable-next-line:no-empty-interface
export interface RentalbillingState extends EntityState<RentalbillingModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRentalbillingId: string;
	lastQuery: QueryRentalbillingModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RentalbillingModel> = createEntityAdapter<RentalbillingModel>(
	{ selectId: model => model._id, }
);

export const initialRentalbillingState: RentalbillingState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRentalbillingModel({}),
	lastCreatedRentalbillingId: undefined,
	showInitWaitingMessage: true
});

export function rentalbillingReducer(state = initialRentalbillingState, action: RentalbillingActions): RentalbillingState {
	switch  (action.type) {
		case RentalbillingActionTypes.RentalbillingPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRentalbillingId: undefined
		};
		case RentalbillingActionTypes.RentalbillingActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RentalbillingActionTypes.RentalbillingOnServerCreated: return {
			...state
		};
		case RentalbillingActionTypes.RentalbillingCreated: return adapter.addOne(action.payload.rentalbilling, {
			...state, lastCreatedBlockId: action.payload.rentalbilling._id
		});
		case RentalbillingActionTypes.RentalbillingUpdated: return adapter.updateOne(action.payload.partialRentalbilling, state);
		case RentalbillingActionTypes.RentalbillingDeleted: return adapter.removeOne(action.payload.id, state);
		case RentalbillingActionTypes.RentalbillingPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRentalbillingModel({})
		};
		case RentalbillingActionTypes.RentalbillingPageLoaded: {
			return adapter.addMany(action.payload.rentalbilling, {
				...initialRentalbillingState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRentalbillingState = createFeatureSelector<RentalbillingState>('rentalbilling');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
