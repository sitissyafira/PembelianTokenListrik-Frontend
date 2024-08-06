// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectWaterMeterInStore, selectWaterMeterPageLoading, selectWaterMeterShowInitWaitingMessage } from './meter.selector';


export class WaterMeterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectWaterMeterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectWaterMeterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectWaterMeterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
