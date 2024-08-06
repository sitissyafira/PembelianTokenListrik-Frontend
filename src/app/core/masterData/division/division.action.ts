import { Action } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { DivisionModel } from './division.model';
import { QueryDivisionModel } from './querydivision.model';

export enum DivisionActionTypes {
	AllUsersRequested = '[Block Module] All Division Requested',
	AllUsersLoaded = '[Block API] All Division Loaded',
	DivisionOnServerCreated = '[Edit Division Component] Division On Server Created',
	DivisionCreated = '[Edit Division Dialog] Division Created',
	DivisionUpdated = '[Edit Division Dialog] Division Updated',
	DivisionDeleted = '[Division List Page] Division Deleted',
	DivisionPageRequested = '[Division List Page] Division Page Requested',
	DivisionPageLoaded = '[Division API] Division Page Loaded',
	DivisionPageCancelled = '[Division API] Division Page Cancelled',
	DivisionPageToggleLoading = '[Division] Division Page Toggle Loading',
	DivisionActionToggleLoading = '[Division] Division Action Toggle Loading'
}
export class DivisionOnServerCreated implements Action {
	readonly type = DivisionActionTypes.DivisionOnServerCreated;
	constructor(public payload: { division: DivisionModel }) { }
}
export class DivisionCreated implements Action {
	readonly type = DivisionActionTypes.DivisionCreated;
	constructor(public payload: { division: DivisionModel }) { }
}
export class DivisionUpdated implements Action {
	readonly type = DivisionActionTypes.DivisionUpdated;
	constructor(public payload: {
		partialDivision: Update<DivisionModel>,
		division: DivisionModel
	}) { }
}
export class DivisionDeleted implements Action {
	readonly type = DivisionActionTypes.DivisionDeleted;

	constructor(public payload: { id: string }) {}
}
export class DivisionPageRequested implements Action {
	readonly type = DivisionActionTypes.DivisionPageRequested;
	constructor(public payload: { page: QueryDivisionModel }) { }
}
export class DivisionPageLoaded implements Action {
	readonly type = DivisionActionTypes.DivisionPageLoaded;
	constructor(public payload: { division: DivisionModel[], totalCount: number, page: QueryDivisionModel  }) { }
}
export class DivisionPageCancelled implements Action {
	readonly type = DivisionActionTypes.DivisionPageCancelled;
}
export class DivisionPageToggleLoading implements Action {
	readonly type = DivisionActionTypes.DivisionPageToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export class DivisionActionToggleLoading implements Action {
	readonly type = DivisionActionTypes.DivisionActionToggleLoading;
	constructor(public payload: { isLoading: boolean }) { }
}
export type DivisionActions = DivisionCreated
	| DivisionUpdated
	| DivisionDeleted
	| DivisionOnServerCreated
	| DivisionPageLoaded
	| DivisionPageCancelled
	| DivisionPageToggleLoading
	| DivisionPageRequested
	| DivisionActionToggleLoading;
