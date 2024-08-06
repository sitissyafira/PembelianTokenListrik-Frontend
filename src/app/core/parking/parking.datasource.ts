// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectParkingInStore, selectParkingPageLoading, selectParkingShowInitWaitingMessage } from './parking.selector';


export class ParkingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectParkingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectParkingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectParkingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
