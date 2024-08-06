// NGRX
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
// Actions
import { PackagesActions, PackagesActionTypes } from './packages.action';
// CRUD

// Models
import { PackagesModel } from './packages.model';
import { QueryPackagesModel } from './querypackages.model';

// tslint:disable-next-line:no-empty-interface
export interface PackagesState extends EntityState<PackagesModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedPackagesId: string;
	lastQuery: QueryPackagesModel;
	showInitWaitingMessage: boolean;
}

export const adapter: EntityAdapter<PackagesModel> = createEntityAdapter<PackagesModel>(
	{ selectId: model => model._id, }
);

export const initialPackagesState: PackagesState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryPackagesModel({}),
	lastCreatedPackagesId: undefined,
	showInitWaitingMessage: true
});

export function packagesReducer(state = initialPackagesState, action: PackagesActions): PackagesState {
	switch  (action.type) {
		case PackagesActionTypes.PackagesPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedPackagesId: undefined
		};
		case PackagesActionTypes.PackagesActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case PackagesActionTypes.PackagesOnServerCreated: return {
			...state
		};
		case PackagesActionTypes.PackagesCreated: return adapter.addOne(action.payload.packages, {
			...state, lastCreatedBlockId: action.payload.packages._id
		});
		case PackagesActionTypes.PackagesUpdated: return adapter.updateOne(action.payload.partialPackages, state);
		case PackagesActionTypes.PackagesDeleted: return adapter.removeOne(action.payload.id, state);
		case PackagesActionTypes.PackagesPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryPackagesModel({})
		};
		case PackagesActionTypes.PackagesPageLoaded: {
			return adapter.addMany(action.payload.packages, {
				...initialPackagesState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}

export const getPackagesState = createFeatureSelector<PackagesState>('packages');

export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
