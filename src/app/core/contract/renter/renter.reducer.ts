// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RenterContractActions, RenterContractActionTypes } from './renter.action';
// CRUD

// Models
import { RenterContractModel } from './renter.model';
import { QueryrenterModel } from './queryrenter.model';

// tslint:disable-next-line:no-empty-interface
export interface RenterContractState extends EntityState<RenterContractModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRenterContractId: string;
	lastQuery: QueryrenterModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RenterContractModel> = createEntityAdapter<RenterContractModel>(
	{ selectId: model => model._id, }
);

export const initialRenterContractState: RenterContractState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryrenterModel({}),
	lastCreatedRenterContractId: undefined,
	showInitWaitingMessage: true
});

export function rentercontractReducer(state = initialRenterContractState, action: RenterContractActions): RenterContractState {
	switch (action.type) {
		case RenterContractActionTypes.RenterContractPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRenterContractId: undefined
		};
		case RenterContractActionTypes.RenterContractActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RenterContractActionTypes.RenterContractOnServerCreated: return {
			...state
		};
		case RenterContractActionTypes.RenterContractCreated: return adapter.addOne(action.payload.rentercontract, {
			...state, lastCreatedBlockId: action.payload.rentercontract._id
		});
		case RenterContractActionTypes.RenterContractUpdated: return adapter.updateOne(action.payload.partialRenterContract, state);
		case RenterContractActionTypes.RenterContractDeleted: return adapter.removeOne(action.payload.id, state);
		case RenterContractActionTypes.RenterContractPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryrenterModel({})
		};
		case RenterContractActionTypes.RenterContractPageLoaded: {
			return adapter.addMany(action.payload.rentercontract, {
				...initialRenterContractState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		case RenterContractActionTypes.RenterContractPageToggleCheckout: {
			return adapter.addMany(action.payload.rentercontract, {
				...initialRenterContractState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRenterContractState = createFeatureSelector<RenterContractState>('rentercontract');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
