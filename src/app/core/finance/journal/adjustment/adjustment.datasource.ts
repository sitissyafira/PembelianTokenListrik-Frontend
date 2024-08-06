// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../reducers';
import { selectAdjustmentInStore, selectAdjustmentPageLoading, selectAdjustmentShowInitWaitingMessage } from './adjustment.selector';


export class AdjustmentDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectAdjustmentPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectAdjustmentShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectAdjustmentInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
