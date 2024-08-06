import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QueryResultsModel, HttpExtenstionsModel } from '../../_base/crud';
import { PaymentPoState } from './paymentPo.reducer';
import { each } from 'lodash';
import { PaymentPoModel } from './paymentPo.model';


export const selectPaymentPoState = createFeatureSelector<PaymentPoState>('paymentPo');

export const selectPaymentPoById = (paymentPoId: string) => createSelector(
	selectPaymentPoState,
	paymentPoState =>  paymentPoState.entities[paymentPoId]
);
export const selectPaymentPoPageLoading = createSelector(
	selectPaymentPoState,
	paymentPoState => {
		return paymentPoState.listLoading;
	}
);
export const selectPaymentPoActionLoading = createSelector(
	selectPaymentPoState,
	paymentPoState => paymentPoState.actionsloading
);
export const selectLastCreatedPaymentPoId = createSelector(
	selectPaymentPoState,
	paymentPoState => paymentPoState.lastCreatedPaymentPoId
);
export const selectPaymentPoPageLastQuery = createSelector(
	selectPaymentPoState,
	paymentPoState => paymentPoState.lastQuery
);
export const selectPaymentPoInStore = createSelector(
	selectPaymentPoState,
	paymentPoState => {
		const items: PaymentPoModel[] = [];
		each(paymentPoState.entities, element => {
			items.push(element);
		});
		const httpExtension = new HttpExtenstionsModel();
		const result: PaymentPoModel[] = httpExtension.sortArray(items);
		return new QueryResultsModel(result, paymentPoState.totalCount, '');
	}
);
export const selectPaymentPoShowInitWaitingMessage = createSelector(
	selectPaymentPoState,
	paymentPoState => paymentPoState.showInitWaitingMessage
);
export const selectHasPaymentPoInStore = createSelector(
	selectPaymentPoState,
	queryResult => {
		if (!queryResult.totalCount) {
			return false;
		}
		return true;
	}
);
