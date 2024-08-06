// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../reducers';
import { selectPowerPrabayarInStore, selectPowerPrabayarPageLoading, selectPowerPrabayarShowInitWaitingMessage } from './prabayar.selector';


export class PowerPrabayarDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowerPrabayarPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowerPrabayarShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowerPrabayarInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
