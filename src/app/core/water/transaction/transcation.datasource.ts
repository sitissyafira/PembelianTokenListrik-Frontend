// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSourceUpd, QueryResultsModelUpd } from '../../_base/crud-upd';
// State
import { AppState } from '../../../core/reducers';
import { selectWaterTransactionInStore, selectWaterTransactionPageLoading, selectWaterTransactionShowInitWaitingMessage } from './transaction.selector';


export class WaterTransactionDataSource extends BaseDataSourceUpd {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectWaterTransactionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectWaterTransactionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectWaterTransactionInStore)
		).subscribe((response: QueryResultsModelUpd) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
			this.allTotalSubject.next(response.allTotalCount)
		});
	}
}
