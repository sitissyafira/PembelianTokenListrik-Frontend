//DataSource
export { GalonRateDataSource } from './rate/rate.datasource'

//Services
export { GalonRateService } from './rate/rate.service'

//ACTIONS

export {
	GalonRateActions,
	GalonRateActionToggleLoading,
	GalonRateActionTypes,
	GalonRateCreated,
	GalonRateDeleted,
	GalonRateOnServerCreated,
	GalonRatePageCancelled,
	GalonRatePageLoaded,
	GalonRatePageRequested,
	GalonRatePageToggleLoading,
	GalonRateUpdated
} from './rate/rate.action'

// EFFECTS
export { GalonRateEffect } from './rate/rate.effect'

// REDUCERS
export { galonrateReducer } from './rate/rate.reducer'

//SELECTOR
export {
	selectHasGalonRateInStore,
	selectLastCreatedGalonRateId,
	selectGalonRateActionLoading,
	selectGalonRateById,
	selectGalonRateInStore,
	selectGalonRatePageLastQuery,
	selectGalonRatePageLoading,
	selectGalonRateShowInitWaitingMessage,
	selectGalonRateState
} from './rate/rate.selector'
