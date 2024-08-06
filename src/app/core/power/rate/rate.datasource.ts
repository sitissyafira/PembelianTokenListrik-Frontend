// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPowerRateInStore, selectPowerRatePageLoading, selectPowerRateShowInitWaitingMessage } from './rate.selector';


export class PowerRateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowerRatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowerRateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowerRateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
