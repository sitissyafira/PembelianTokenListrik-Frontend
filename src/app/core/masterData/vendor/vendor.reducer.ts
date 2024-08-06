
import { createFeatureSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { VendorActions, VendorActionTypes } from './vendor.action';
import { VendorModel } from './vendor.model';
import { QueryVendorModel } from './queryvendor.model';

export interface VendorState extends EntityState<VendorModel> {
	listLoading: boolean;
	actionsloading: boolean;
	totalCount: number;
	lastCreatedVendorId: string;
	lastQuery: QueryVendorModel;
	showInitWaitingMessage: boolean;
}
export const adapter: EntityAdapter<VendorModel> = createEntityAdapter<VendorModel>(
	{ selectId: model => model._id, }
);
export const initialVendorState: VendorState = adapter.getInitialState({
	listLoading: false,
	actionsloading: false,
	totalCount: 0,
	lastQuery:  new QueryVendorModel({}),
	lastCreatedVendorId: undefined,
	showInitWaitingMessage: true
});
export function vendorReducer(state = initialVendorState, action: VendorActions): VendorState {
	switch  (action.type) {
		case VendorActionTypes.VendorPageToggleLoading: return {
			...state, listLoading: action.payload.isLoading, lastCreatedVendorId: undefined
		};
		case VendorActionTypes.VendorActionToggleLoading: return {
			...state, actionsloading: action.payload.isLoading
		};
		case VendorActionTypes.VendorOnServerCreated: return {
			...state
		};
		case VendorActionTypes.VendorCreated: return adapter.addOne(action.payload.vendor, {
			...state, lastCreatedBlockId: action.payload.vendor._id
		});
		case VendorActionTypes.VendorUpdated: return adapter.updateOne(action.payload.partialVendor, state);
		case VendorActionTypes.VendorDeleted: return adapter.removeOne(action.payload.id, state);
		case VendorActionTypes.VendorPageCancelled: return {
			...state, listLoading: false, lastQuery: new QueryVendorModel({})
		};
		case VendorActionTypes.VendorPageLoaded: {
			return adapter.addMany(action.payload.vendor, {
				...initialVendorState,
				totalCount: action.payload.totalCount,
				lastQuery: action.payload.page,
				listLoading: false,
				showInitWaitingMessage: false
			});
		}
		default: return state;
	}
}
export const getVendorState = createFeatureSelector<VendorState>('vendor');
export const {
	selectAll,
	selectEntities,
	selectIds,
	selectTotal
} = adapter.getSelectors();
