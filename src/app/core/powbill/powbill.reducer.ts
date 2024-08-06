// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PowbillActions, PowbillActionTypes } from './powbill.action';
// CRUD

// Models
import { PowbillModel } from './powbill.model';
import { QueryPowbillModel } from './querypowbill.model';

// tslint:disable-next-line:no-empty-interface
export interface PowbillState extends EntityState<PowbillModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPowbillId: string;
	lastQuery: QueryPowbillModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PowbillModel> = createEntityAdapter<PowbillModel>(
	{ selectId: model => model._id, }
);

export const initialPowbillState: PowbillState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPowbillModel({}),
	lastCreatedPowbillId: undefined,
	showInitWaitingMessage: true
});

export function powbillReducer(state = initialPowbillState, action: PowbillActions): PowbillState {
	switch  (action.type) {
		case PowbillActionTypes.PowbillPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPowbillId: undefined
		};
		case PowbillActionTypes.PowbillActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PowbillActionTypes.PowbillOnServerCreated: return {
			...state
		};
		case PowbillActionTypes.PowbillCreated: return adapter.addOne(action.payload.powbill, {
			...state, lastCreatedBlockId: action.payload.powbill._id
		});
		case PowbillActionTypes.PowbillUpdated: return adapter.updateOne(action.payload.partialPowbill, state);
		case PowbillActionTypes.PowbillDeleted: return adapter.removeOne(action.payload.id, state);
		case PowbillActionTypes.PowbillPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPowbillModel({})
		};
		case PowbillActionTypes.PowbillPageLoaded: {
			return adapter.addMany(action.payload.powbill, {
				...initialPowbillState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPowbillState = createFeatureSelector<PowbillState>('powbill');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
