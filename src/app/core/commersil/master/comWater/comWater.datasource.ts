import { Store, select } from '@ngrx/store';
import { BaseDataSource, QueryResultsModel } from '../../../_base/crud';
import { AppState } from '../../../../core/reducers';
import { selectComWaterInStore, selectComWaterPageLoading, selectComWaterShowInitWaitingMessage } from './comWater.selector';


export class ComWaterDataSource extends BaseDataSource {
	constructor(private store: Store<AppState>) {
		super();

		this.loading$ = this.store.pipe(
			select(selectComWaterPageLoading)
		);

		this.isPreloadTextViewed$ = this.store.pipe(
			select(selectComWaterShowInitWaitingMessage)
		);

		this.store.pipe(
			select(selectComWaterInStore)
		).subscribe((response: QueryResultsModel) => {
			this.paginatorTotalSubject.next(response.totalCount);
			this.entitySubject.next(response.items);
		});
	}
}
