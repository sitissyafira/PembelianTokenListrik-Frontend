// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { RentalActions, RentalActionTypes } from './rental.action';
// CRUD

// Models
import { RentalModel } from './rental.model';
import { QueryRentalModel } from './queryrental.model';

// tslint:disable-next-line:no-empty-interface
export interface RentalState extends EntityState<RentalModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedRentalId: string;
	lastQuery: QueryRentalModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<RentalModel> = createEntityAdapter<RentalModel>(
	{ selectId: model => model._id, }
);

export const initialRentalState: RentalState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryRentalModel({}),
	lastCreatedRentalId: undefined,
	showInitWaitingMessage: true
});

export function rentalReducer(state = initialRentalState, action: RentalActions): RentalState {
	switch  (action.type) {
		case RentalActionTypes.RentalPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedRentalId: undefined
		};
		case RentalActionTypes.RentalActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case RentalActionTypes.RentalOnServerCreated: return {
			...state
		};
		case RentalActionTypes.RentalCreated: return adapter.addOne(action.payload.rental, {
			...state, lastCreatedBlockId: action.payload.rental._id
		});
		case RentalActionTypes.RentalUpdated: return adapter.updateOne(action.payload.partialRental, state);
		case RentalActionTypes.RentalDeleted: return adapter.removeOne(action.payload.id, state);
		case RentalActionTypes.RentalPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryRentalModel({})
		};
		case RentalActionTypes.RentalPageLoaded: {
			return adapter.addMany(action.payload.rental, {
				...initialRentalState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getRentalState = createFeatureSelector<RentalState>('rental');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
