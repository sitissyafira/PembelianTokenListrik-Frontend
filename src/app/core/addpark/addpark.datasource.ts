// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectAddparkInStore, selectAddparkPageLoading, selectAddparkShowInitWaitingMessage } from './addpark.selector';


export class AddparkDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAddparkPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAddparkShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAddparkInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
