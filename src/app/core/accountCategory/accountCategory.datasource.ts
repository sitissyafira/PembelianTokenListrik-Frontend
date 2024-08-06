// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers'
import { selectAccountCategoryInStore, selectAccountCategoryPageLoading, selectAccountCategoryShowInitWaitingMessage } from './accountCategory.selector';


export class AccountCategoryDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAccountCategoryPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAccountCategoryShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAccountCategoryInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
