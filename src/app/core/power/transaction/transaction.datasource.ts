// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSourceUpd, QueryResultsModelUpd } from '../../_base/crud-upd';
// State
import { AppState } from '../../../core/reducers';
import { selectPowerTransactionInStore, selectPowerTransactionPageLoading, selectPowerTransactionShowInitWaitingMessage } from './transaction.selector';


export class PowerTransactionDataSource extends BaseDataSourceUpd {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPowerTransactionPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPowerTransactionShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPowerTransactionInStore)
		).subscribe((response: QueryResultsModelUpd) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.allTotalSubject.next(response.allTotalCount)
			this.entitySubject.next(response.items);
		});
	}
}
