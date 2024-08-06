// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
// State
import { AppState } from '../../../core/reducers';
import { selectRentalInStore, selectRentalPageLoading, selectRentalShowInitWaitingMessage } from './rental.selector';


export class RentalDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRentalPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRentalShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRentalInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
