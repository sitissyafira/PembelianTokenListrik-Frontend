// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectCategoryInStore, selectCategoryPageLoading, selectCategoryShowInitWaitingMessage } from './category.selector';


export class CategoryDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectCategoryPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectCategoryShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectCategoryInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
