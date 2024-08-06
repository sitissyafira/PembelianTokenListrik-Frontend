// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectPowerMeterInStore, selectPowerMeterPageLoading, selectPowerMeterShowInitWaitingMessage } from './meter.selector';


export class PowerMeterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowerMeterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowerMeterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowerMeterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
