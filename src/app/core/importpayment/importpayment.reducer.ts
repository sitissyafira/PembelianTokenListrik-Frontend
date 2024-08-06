// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { ImportpaymentActions, ImportpaymentActionTypes } from './importpayment.action';
// CRUD

// Models
import { ImportpaymentModel } from './importpayment.model';
import { QueryImportpaymentModel } from './queryimportpayment.model';

// tslint:disable-next-line:no-empty-interface
export interface ImportpaymentState extends EntityState<ImportpaymentModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedImportpaymentId: string;
	lastQuery: QueryImportpaymentModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<ImportpaymentModel> = createEntityAdapter<ImportpaymentModel>(
	{ selectId: model => model._id, }
);

export const initialImportpaymentState: ImportpaymentState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryImportpaymentModel({}),
	lastCreatedImportpaymentId: undefined,
	showInitWaitingMessage: true
});

export function importpaymentReducer(state = initialImportpaymentState, action: ImportpaymentActions): ImportpaymentState {
	switch (action.type) {
		case ImportpaymentActionTypes.ImportpaymentPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedImportpaymentId: undefined
		};
		case ImportpaymentActionTypes.ImportpaymentActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case ImportpaymentActionTypes.ImportpaymentOnServerCreated: return {
			...state
		};
		case ImportpaymentActionTypes.ImportpaymentCreated: return adapter.addOne(action.payload.importpayment, {
			...state, lastCreatedBlockId: action.payload.importpayment._id
		});
		case ImportpaymentActionTypes.ImportpaymentUpdated: return adapter.updateOne(action.payload.partialImportpaymentbilling, state);
		case ImportpaymentActionTypes.ImportpaymentDeleted: return adapter.removeOne(action.payload.id, state);
		case ImportpaymentActionTypes.ImportpaymentPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryImportpaymentModel({})
		};
		case ImportpaymentActionTypes.ImportpaymentPageLoaded: {
			return adapter.addMany(action.payload.importpayment, {
				...initialImportpaymentState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRentalbillingState = createFeatureSelector<ImportpaymentState>('importpayment');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
