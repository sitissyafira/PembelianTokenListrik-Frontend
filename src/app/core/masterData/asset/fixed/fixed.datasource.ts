// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../../core/reducers';
import { selectFixedInStore, selectFixedPageLoading, selectFixedShowInitWaitingMessage } from './fixed.selector';


export class FixedDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectFixedPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectFixedShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectFixedInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
