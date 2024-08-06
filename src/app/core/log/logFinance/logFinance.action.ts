import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { LogFinanceModel } from './logFinance.model';
import { QueryLogFinanceModel } from './querylogFinance.model';

export enum LogFinanceActionTypes {
	AllUsersRequested = '[LogFinance Module] All LogFinance Requested',
	AllUsersLoaded = '[LogFinance API] All LogFinance Loaded',
	LogFinanceOnServerCreated = '[Edit LogFinance Component] LogFinance On Server Created',
	LogFinanceCreated = '[Edit LogFinance Dialog] LogFinance Created',
	LogFinanceUpdated = '[Edit LogFinance Dialog] LogFinance Updated',
	LogFinanceDeleted = '[LogFinance List Page] LogFinance Deleted',


	//finance
	LogFinancePageRequested = '[LogFinance List Page] LogFinance Page Requested',
	LogFinancePageLoaded = '[LogFinance API] LogFinance Page Loaded',

	LogFinancePageRequestedAP = '[LogFinanceAP List Page] LogFinanceAP Page Requested',
	LogFinancePageLoadedAP = '[LogFinanceAP API] LogFinanceAP Page Loaded',

	//purchasing
	LogFinancePageRequestedPR = '[LogFinancePR List Page] LogFinancePR Page Requested',
	LogFinancePageLoadedPR = '[LogFinancePR API] LogFinancePR Page Loaded',

	LogFinancePageRequestedPO = '[LogFinancePO List Page] LogFinancePP Page Requested',
	LogFinancePageLoadedPO = '[LogFinancePO API] LogFinancePO Page Loaded',

	LogFinancePageRequestedQU = '[LogFinanceQU List Page] LogFinanceQU Page Requested',
	LogFinancePageLoadedQU = '[LogFinanceQU API] LogFinanceQU Page Loaded',


	//inventory
	LogFinancePageRequestedPD = '[LogFinancePD List Page] LogFinancePD Page Requested',
	LogFinancePageLoadedPD = '[LogFinancePD API] LogFinancePD Page Loaded',

	LogFinancePageRequestedSI = '[LogFinanceSI List Page] LogFinanceSI Page Requested',
	LogFinancePageLoadedSI = '[LogFinanceSI API] LogFinanceSI Page Loaded',


	LogFinancePageCancelled = '[LogFinance API] LogFinance Page Cancelled',
	LogFinancePageToggleLoading = '[LogFinance] LogFinance Page Toggle Loading',
	LogFinanceActionToggleLoading = '[LogFinance] LogFinance Action Toggle Loading'
}
export class LogFinanceOnServerCreated implements Action {
	readonly type = LogFinanceActionTypes.LogFinanceOnServerCreated;
	constructor(public payload: { logFinance: LogFinanceModel }) { }
}

export class LogFinanceCreated implements Action {
	readonly type = LogFinanceActionTypes.LogFinanceCreated;
	constructor(public payload: { logFinance: LogFinanceModel }) { }
}


export class LogFinanceUpdated implements Action {
	readonly type = LogFinanceActionTypes.LogFinanceUpdated;
	constructor(public payload: {
		partialLogFinance: Update<LogFinanceModel>,
		logFinance: LogFinanceModel
	}) { }
}

export class LogFinanceDeleted implements Action {
	readonly type = LogFinanceActionTypes.LogFinanceDeleted;

	constructor(public payload: { id: string }) {}
}

export class LogFinancePageRequested implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequested;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoaded implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoaded;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}

export class LogFinancePageRequestedAP implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedAP;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedAP implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedAP;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}

export class LogFinancePageRequestedPR implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedPR;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedPR implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedPR;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}


export class LogFinancePageRequestedPO implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedPO;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedPO implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedPO;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}

export class LogFinancePageRequestedSI implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedSI;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedSI implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedSI;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}




export class LogFinancePageRequestedQU implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedQU;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedQU implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedQU;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}



export class LogFinancePageRequestedPD implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageRequestedPD;
	constructor(public payload: { page: QueryLogFinanceModel }) { }
}

export class LogFinancePageLoadedPD implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageLoadedPD;
	constructor(public payload: { logFinance: LogFinanceModel[], totalCount: number, page: QueryLogFinanceModel  }) { }
}


export class LogFinancePageCancelled implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageCancelled;
}

export class LogFinancePageToggleLoading implements Action {
	readonly type = LogFinanceActionTypes.LogFinancePageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export class LogFinanceActionToggleLoading implements Action {
	readonly type = LogFinanceActionTypes.LogFinanceActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}

export type LogFinanceActions = LogFinanceCreated
	| LogFinanceUpdated
	| LogFinanceDeleted
	| LogFinanceOnServerCreated
	| LogFinancePageLoaded
	| LogFinancePageCancelled
	| LogFinancePageToggleLoading
	| LogFinancePageRequested
	| LogFinanceActionToggleLoading;
