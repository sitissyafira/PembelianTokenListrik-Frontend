import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { VendorState } from './vendor.reducer';
import { each } from 'lodash';
import { VendorModel } from './vendor.model';


export const selectVendorState = createFeatureSelector<VendorState>('vendor');

export const selectVendorById = (vendorId: string) => createSelector(
	selectVendorState,
	vendorState =>  vendorState.entities[vendorId]
);
export const selectVendorPageLoading = createSelector(
	selectVendorState,
	vendorState => {
		return vendorState.listLoading;
	}
);
export const selectVendorActionLoading = createSelector(
	selectVendorState,
	vendorState => vendorState.actionsloading
);
export const selectLastCreatedVendorId = createSelector(
	selectVendorState,
	vendorState => vendorState.lastCreatedVendorId
);
export const selectVendorPageLastQuery = createSelector(
	selectVendorState,
	vendorState => vendorState.lastQuery
);
export const selectVendorInStore = createSelector(
	selectVendorState,
	vendorState => {
		const items: VendorModel[] = [];
		each(vendorState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: VendorModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, vendorState.totalCount, '');
	}
);
export const selectVendorShowInitWaitingMessage = createSelector(
	selectVendorState,
	vendorState => vendorState.showInitWaitingMessage
);
export const selectHasVendorInStore = createSelector(
	selectVendorState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
