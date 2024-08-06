// NGRX
import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
// CRUD
import { ImportpaymentModel } from './importpayment.model';
import { QueryImportpaymentModel } from './queryimportpayment.model';
// Models

export enum ImportpaymentActionTypes {
	AllUsersRequested = '[Block Module] All Block Requested',
	AllUsersLoaded = '[Block API] All Block Loaded',
	ImportpaymentOnServerCreated = '[Edit Importpayment Component] Importpayment On Server Created',
	ImportpaymentCreated = '[Edit Importpayment Dialog] Importpayment Created',
	ImportpaymentUpdated = '[Edit Importpayment Dialog] Importpayment Updated',
	ImportpaymentDeleted = '[Importpayment List Page] Importpayment Deleted',
	ImportpaymentPageRequested = '[Importpayment List Page] Importpayment Page Requested',
	ImportpaymentPageLoaded = '[Importpayment API] Importpayment Page Loaded',
	ImportpaymentPageCancelled = '[Importpayment API] Importpayment Page Cancelled',
	ImportpaymentPageToggleLoading = '[Importpayment] Importpayment Page Toggle Loading',
	ImportpaymentActionToggleLoading = '[Importpayment] Importpayment Action Toggle Loading'
}
export class ImportpaymentOnServerCreated implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentOnServerCreated;
	constructor(public payload: { importpayment: ImportpaymentModel }) { }
}

export class ImportpaymentCreated implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentCreated;
	constructor(public payload: { importpayment: ImportpaymentModel }) { }
}


export class ImportpaymentUpdated implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentUpdated;
	constructor(public payload: {
		partialImportpaymentbilling: Update<ImportpaymentModel>,
		importpayment: ImportpaymentModel
	}) { }
}

export class ImportpaymentDeleted implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentDeleted;

	constructor(public payload: { id: string }) { }
}

export class ImportpaymentPageRequested implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentPageRequested;
	constructor(public payload: { page: QueryImportpaymentModel }) { }
}

export class ImportpaymentPageLoaded implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentPageLoaded;
	constructor(public payload: { importpayment: ImportpaymentModel[], totalCount: number, page: QueryImportpaymentModel }) { }
}


export class ImportpaymentPageCancelled implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentPageCancelled;
}

export class ImportpaymentPageToggleLoading implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class ImportpaymentActionToggleLoading implements Action {
	readonly type = ImportpaymentActionTypes.ImportpaymentActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type ImportpaymentActions = ImportpaymentCreated
	| ImportpaymentUpdated
	| ImportpaymentDeleted
	| ImportpaymentOnServerCreated
	| ImportpaymentPageLoaded
	| ImportpaymentPageCancelled
	| ImportpaymentPageToggleLoading
	| ImportpaymentPageRequested
	| ImportpaymentActionToggleLoading;
