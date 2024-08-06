// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectManagementTaskInStore, selectManagementTaskPageLoading, selectManagementTaskShowInitWaitingMessage } from './managementTask.selector';


export class ManagementTaskDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectManagementTaskPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectManagementTaskShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectManagementTaskInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
