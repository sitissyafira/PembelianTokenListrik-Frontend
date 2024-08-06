// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
// State
import { AppState } from '../../../../core/reducers';
import { selectUomInStore, selectUomPageLoading, selectUomShowInitWaitingMessage } from './uom.selector';


export class UomDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectUomPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectUomShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectUomInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
