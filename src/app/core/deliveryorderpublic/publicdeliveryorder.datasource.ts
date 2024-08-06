// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../reducers';
import { selectPublicDeliveryorderInStore, selectPublicDeliveryorderPageLoading, selectPublicDeliveryorderShowInitWaitingMessage } from './publicdeliveryorder.selector';


export class PublicDeliveryorderDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectPublicDeliveryorderPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectPublicDeliveryorderShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectPublicDeliveryorderInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
