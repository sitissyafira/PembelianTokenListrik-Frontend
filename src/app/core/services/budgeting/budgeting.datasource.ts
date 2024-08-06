// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectBudgetingInStore, selectBudgetingPageLoading, selectBudgetingShowInitWaitingMessage } from './budgeting.selector';


export class BudgetingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectBudgetingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectBudgetingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectBudgetingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
