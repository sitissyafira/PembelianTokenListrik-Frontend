// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { OwnershipContractActions, OwnershipContractActionTypes } from './ownership.action';
// CRUD

// Models
import { OwnershipContractModel } from './ownership.model';
import { QueryOwnerTransactionModel } from './queryowner.model';

// tslint:disable-next-line:no-empty-interface
export interface OwnershipContractState extends EntityState<OwnershipContractModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedOwnershipContractId: string;
	lastQuery: QueryOwnerTransactionModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<OwnershipContractModel> = createEntityAdapter<OwnershipContractModel>(
	{ selectId: model => model._id, }
);

export const initialOwnershipContractState: OwnershipContractState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryOwnerTransactionModel({}),
	lastCreatedOwnershipContractId: undefined,
	showInitWaitingMessage: true
});

export function ownershipcontractReducer(state = initialOwnershipContractState, action: OwnershipContractActions): OwnershipContractState {
	switch  (action.type) {
		case OwnershipContractActionTypes.OwnershipContractPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedOwnershipContractId: undefined
		};
		case OwnershipContractActionTypes.OwnershipContractActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case OwnershipContractActionTypes.OwnershipContractOnServerCreated: return {
			...state
		};
		case OwnershipContractActionTypes.OwnershipContractCreated: return adapter.addOne(action.payload.ownershipcontract, {
			...state, lastCreatedBlockId: action.payload.ownershipcontract._id
		});
		case OwnershipContractActionTypes.OwnershipContractUpdated: return adapter.updateOne(action.payload.partialOwnershipContract, state);
		case OwnershipContractActionTypes.OwnershipContractDeleted: return adapter.removeOne(action.payload.id, state);
		case OwnershipContractActionTypes.OwnershipContractPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryOwnerTransactionModel({})
		};
		case OwnershipContractActionTypes.OwnershipContractPageLoaded: {
			return adapter.addMany(action.payload.ownershipcontract, {
				...initialOwnershipContractState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getOwnershipContractState = createFeatureSelector<OwnershipContractState>('ownershipcontract');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
