// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { LeaseContractActions, LeaseContractActionTypes } from './lease.action';
// CRUD

// Models
import { LeaseContractModel } from './lease.model';
import { QueryleaseModel } from './querylease.model';

// tslint:disable-next-line:no-empty-interface
export interface LeaseContractState extends EntityState<LeaseContractModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedLeaseContractId: string;
	lastQuery: QueryleaseModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<LeaseContractModel> = createEntityAdapter<LeaseContractModel>(
	{ selectId: model => model._id, }
);

export const initialLeaseContractState: LeaseContractState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryleaseModel({}),
	lastCreatedLeaseContractId: undefined,
	showInitWaitingMessage: true
});

export function leasecontractReducer(state = initialLeaseContractState, action: LeaseContractActions): LeaseContractState {
	switch (action.type) {
		case LeaseContractActionTypes.LeaseContractPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedLeaseContractId: undefined
		};
		case LeaseContractActionTypes.LeaseContractActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case LeaseContractActionTypes.LeaseContractOnServerCreated: return {
			...state
		};
		case LeaseContractActionTypes.LeaseContractCreated: return adapter.addOne(action.payload.leasecontract, {
			...state, lastCreatedBlockId: action.payload.leasecontract._id
		});
		case LeaseContractActionTypes.LeaseContractUpdated: return adapter.updateOne(action.payload.partialLeaseContract, state);
		case LeaseContractActionTypes.LeaseContractDeleted: return adapter.removeOne(action.payload.id, state);
		case LeaseContractActionTypes.LeaseContractPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryleaseModel({})
		};
		case LeaseContractActionTypes.LeaseContractPageLoaded: {
			return adapter.addMany(action.payload.leasecontract, {
				...initialLeaseContractState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getLeaseContractState = createFeatureSelector<LeaseContractState>('leasecontract');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
