// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { AmortizationActions, AmortizationActionTypes } from './amortization.action';
// CRUD

// Models
import { AmortizationModel } from './amortization.model';
import { QueryAmortizationModel } from './queryamortization.model';

// tslint:disable-next-line:no-empty-interface
export interface AmortizationState extends EntityState<AmortizationModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedAmortizationId: string;
	lastQuery: QueryAmortizationModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<AmortizationModel> = createEntityAdapter<AmortizationModel>(
	{ selectId: model => model._id, }
);

export const initialAmortizationState: AmortizationState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery: new QueryAmortizationModel({}),
	lastCreatedAmortizationId: undefined,
	showInitWaitingMessage: true
});

export function amortizationReducer(state = initialAmortizationState, action: AmortizationActions): AmortizationState {
	switch (action.type) {
		case AmortizationActionTypes.AmortizationPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedAmortizationId: undefined
		};
		case AmortizationActionTypes.AmortizationActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case AmortizationActionTypes.AmortizationOnServerCreated: return {
			...state
		};
		case AmortizationActionTypes.AmortizationCreated: return adapter.addOne(action.payload.amortization, {
			...state, lastCreatedBlockId: action.payload.amortization._id
		});
		case AmortizationActionTypes.AmortizationUpdated: return adapter.updateOne(action.payload.pamortizationtialAmortization, state);
		case AmortizationActionTypes.AmortizationDeleted: return adapter.removeOne(action.payload.id, state);
		case AmortizationActionTypes.AmortizationPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryAmortizationModel({})
		};
		case AmortizationActionTypes.AmortizationPageLoaded: {
			return adapter.addMany(action.payload.amortization, {
				...initialAmortizationState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getAmortizationState = createFeatureSelector<AmortizationState>('amortization');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
