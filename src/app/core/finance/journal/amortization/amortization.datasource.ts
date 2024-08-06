// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectAmortizationInStore, selectAmortizationPageLoading, selectAmortizationShowInitWaitingMessage } from './amortization.selector';


export class AmortizationDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAmortizationPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAmortizationShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAmortizationInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
