// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../../core/reducers';
import { selectBankInStore, selectBankPageLoading, selectBankShowInitWaitingMessage } from './bank.selector';


export class BankDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBankPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBankShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBankInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
