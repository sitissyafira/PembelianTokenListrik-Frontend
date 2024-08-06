// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  isMockEnabled: true, // You have to switch this, when your real back-end is done
  authTokenKey: 'authce9d77b308c149d5992a80073637e4d5',
  // baseAPI: 'http://122.248.202.143:3555',
  baseAPI: 'http://localhost:3000',
  //DEMO or BRES
  // ====== New IP Public Server Indonesia ======
  // baseAPI: 'http://108.136.183.186:3555',
  base: "DEMO"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

/**
IP BE: 122.248.202.143
IP FE: 18.139.62.104

Port: 
Demo: 3000
Bres Live: 3001
QA: 3002
QC: 3003
QT: 3004
Gym: 3500
Medina: 4001
EPA: 5001
CER: 6001
CPA: 7001
Evinciio: 8001
GPK: 3010
PBM: 3020
MTH: 3040
TERNAQ: 
 */