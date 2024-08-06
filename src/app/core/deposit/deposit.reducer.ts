// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { DepositActions, DepositActionTypes } from './deposit.action';
// CRUD
import { QueryDepositModel } from './querydeposit.model';
// Models
import { DepositModel } from './deposit.model';

// tslint:disable-next-line:no-empty-interface
export interface DepositState extends EntityState<DepositModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedDepositId: string;
	lastQuery: QueryDepositModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<DepositModel> = createEntityAdapter<DepositModel>(
	{ selectId: model => model._id, }
);

export const initialDepositState: DepositState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryDepositModel({}),
	lastCreatedDepositId: undefined,
	showInitWaitingMessage: true
});

export function depositReducer(state = initialDepositState, action: DepositActions): DepositState {
	switch  (action.type) {
		case DepositActionTypes.DepositPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedDepositId: undefined
		};
		case DepositActionTypes.DepositActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case DepositActionTypes.DepositOnServerCreated: return {
			...state
		};
		case DepositActionTypes.DepositCreated: return adapter.addOne(action.payload.deposit, {
			...state, lastCreatedDepositId: action.payload.deposit._id
		});
		case DepositActionTypes.DepositUpdated: return adapter.updateOne(action.payload.partialDeposit, state);
		case DepositActionTypes.DepositDeleted: return adapter.removeOne(action.payload.id, state);
		case DepositActionTypes.DepositPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryDepositModel({})
		};
		case DepositActionTypes.DepositPageLoaded: {
			return adapter.addMany(action.payload.deposit, {
				...initialDepositState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getDepositState = createFeatureSelector<DepositState>('deposit');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
