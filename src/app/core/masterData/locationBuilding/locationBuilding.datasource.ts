import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../_base/crud';
import { AppState } from '../../reducers';
import { selectLocationBuildingInStore, selectLocationBuildingPageLoading, selectLocationBuildingShowInitWaitingMessage } from './locationBuilding.selector';


export class LocationBuildingDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectLocationBuildingPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectLocationBuildingShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectLocationBuildingInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
