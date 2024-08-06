// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../../core/reducers';
import { selectAccountBankInStore, selectAccountBankPageLoading, selectAccountBankShowInitWaitingMessage } from './accountBank.selector';


export class AccountBankDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAccountBankPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAccountBankShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAccountBankInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
