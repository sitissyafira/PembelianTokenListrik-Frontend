// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPackagesInStore, selectPackagesPageLoading, selectPackagesShowInitWaitingMessage } from './packages.selector';


export class PackagesDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPackagesPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPackagesShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPackagesInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
