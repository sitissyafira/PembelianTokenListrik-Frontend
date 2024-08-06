// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectDeliveryorderInStore, selectDeliveryorderPageLoading, selectDeliveryorderShowInitWaitingMessage } from './deliveryorder.selector';


export class DeliveryorderDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDeliveryorderPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDeliveryorderShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDeliveryorderInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
