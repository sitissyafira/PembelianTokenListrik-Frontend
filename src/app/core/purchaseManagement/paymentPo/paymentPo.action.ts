import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { PaymentPoModel } from './paymentPo.model';
import { QueryPaymentPoModel } from './querypaymentPo.model';

export enum PaymentPoActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	PaymentPoOnServerCreated = '[Edit PaymentPo Component] PaymentPo On Server Created',
	PaymentPoCreated = '[Edit PaymentPo Dialog] PaymentPo Created',
	PaymentPoUpdated = '[Edit PaymentPo Dialog] PaymentPo Updated',
	PaymentPoDeleted = '[PaymentPo List Page] PaymentPo Deleted',
	PaymentPoPageRequested = '[PaymentPo List Page] PaymentPo Page Requested',
	PaymentPoPageLoaded = '[PaymentPo API] PaymentPo Page Loaded',
	PaymentPoPageCancelled = '[PaymentPo API] PaymentPo Page Cancelled',
	PaymentPoPageToggleLoading = '[PaymentPo] PaymentPo Page Toggle Loading',
	PaymentPoActionToggleLoading = '[PaymentPo] PaymentPo Action Toggle Loading'
}
export class PaymentPoOnServerCreated implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoOnServerCreated;
	constructor(public payload: { paymentPo: PaymentPoModel }) { }
}
export class PaymentPoCreated implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoCreated;
	constructor(public payload: { paymentPo: PaymentPoModel }) { }
}
export class PaymentPoUpdated implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoUpdated;
	constructor(public payload: {
		partialPaymentPo: Update<PaymentPoModel>,
		paymentPo: PaymentPoModel
	}) { }
}
export class PaymentPoDeleted implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoDeleted;

	constructor(public payload: { id: string }) {}
}
export class PaymentPoPageRequested implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoPageRequested;
	constructor(public payload: { page: QueryPaymentPoModel }) { }
}
export class PaymentPoPageLoaded implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoPageLoaded;
	constructor(public payload: { paymentPo: PaymentPoModel[], totalCount: number, page: QueryPaymentPoModel  }) { }
}
export class PaymentPoPageCancelled implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoPageCancelled;
}
export class PaymentPoPageToggleLoading implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class PaymentPoActionToggleLoading implements Action {
	readonly type = PaymentPoActionTypes.PaymentPoActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type PaymentPoActions = PaymentPoCreated
	| PaymentPoUpdated
	| PaymentPoDeleted
	| PaymentPoOnServerCreated
	| PaymentPoPageLoaded
	| PaymentPoPageCancelled
	| PaymentPoPageToggleLoading
	| PaymentPoPageRequested
	| PaymentPoActionToggleLoading;
