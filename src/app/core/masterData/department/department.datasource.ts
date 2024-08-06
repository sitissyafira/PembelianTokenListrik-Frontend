import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../../core/reducers';
import { selectDepartmentInStore, selectDepartmentPageLoading, selectDepartmentShowInitWaitingMessage } from './department.selector';


export class DepartmentDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectDepartmentPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectDepartmentShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectDepartmentInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
