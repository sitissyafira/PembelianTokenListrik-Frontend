// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectPowbillInStore, selectPowbillPageLoading, selectPowbillShowInitWaitingMessage } from './powbill.selector';


export class PowbillDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowbillPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowbillShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowbillInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
