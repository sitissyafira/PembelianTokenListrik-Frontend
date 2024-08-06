// RxJS
import { of } from 'rxjs';
import { catchError, finalize, tap, debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
// NGRX
import { Store, select } from '@ngrx/store';
// CRUD
import { BaseDataSource, QueryResultsModel } from '../_base/crud';
// State
import { AppState } from '../../core/reducers';
import { selectRoleInStore, selectRolePageLoading, selectRoleShowInitWaitingMessage } from './role.selector';


export class RoleDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectRolePageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectRoleShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectRoleInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
