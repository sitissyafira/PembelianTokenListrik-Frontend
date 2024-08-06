// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectWaterRateInStore, selectWaterRatePageLoading, selectWaterRateShowInitWaitingMessage } from './rate.selector';


export class WaterRateDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectWaterRatePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectWaterRateShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectWaterRateInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
