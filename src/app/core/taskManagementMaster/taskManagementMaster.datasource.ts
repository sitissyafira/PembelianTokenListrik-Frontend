// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectTaskManagementMasterInStore, selectTaskManagementMasterPageLoading, selectTaskManagementMasterShowInitWaitingMessage } from './taskManagementMaster.selector';


export class TaskManagementMasterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectTaskManagementMasterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectTaskManagementMasterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectTaskManagementMasterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
