// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectUnitRateInStore, selectUnitRatePageLoading, selectUnitRateShowInitWaitingMessage } from './unitrate.selector';


export class UnitRateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectUnitRatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectUnitRateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectUnitRateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
