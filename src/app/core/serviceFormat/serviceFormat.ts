import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
@Injectable({
	providedIn: 'root'
})

export class ServiceFormat {
	constructor(private http: HttpClient) { }

	// Format Rupiah (Rp .)
	rupiahFormatImprovement(x) {
		// Float with accounting format
		if (x % 1 != 0) {
			if (x < 0) {
				let num2Str = x.toString();
				let spl = num2Str.split("");
				spl.shift();
				let joi = spl.join("");
				let xStr0 = joi.toString().split("."),
					dec0 = xStr0[1].substr(0, 3),
					Sisa = xStr0[0].length % 3,
					head = xStr0[0].substr(0, Sisa),
					body = xStr0[0].substr(Sisa).match(/\d{1,3}/g);

				if (body) {
					let separate = Sisa ? "." : "";
					return "(" + head + separate + body.join(".") + "," + dec0 + ")";
				}
				return "(" + xStr0[0] + "," + dec0 + ")";
			}
			let xStr0 = x.toString().split("."),
				dec0 = xStr0[1].substr(0, 3),
				Sisa = xStr0[0].length % 3,
				head = xStr0[0].substr(0, Sisa),
				body = xStr0[0].substr(Sisa).match(/\d{1,3}/g);

			if (body) {
				let separate = Sisa ? "." : "";
				return head + separate + body.join(".") + "," + dec0;
			}
			return xStr0[0] + "," + dec0;
		}

		if (x < 0) {
			let num2Str = x.toString();
			let spl = num2Str.split("");
			spl.shift();
			spl = spl.join("");
			let sisa = spl.length % 3,
				headValue = spl.substr(0, sisa),
				bodyValue = spl.substr(sisa).match(/\d{1,3}/g);

			if (bodyValue) {
				let separator = sisa ? "." : "";
				return "(" + headValue + separator + bodyValue.join(".") + ")";
			}
			return "(" + headValue + ")";
		}

		// Integer with accounting format
		let xStr = x.toString(),
			sisa = xStr.length % 3,
			headValue = xStr.substr(0, sisa),
			bodyValue = xStr.substr(sisa).match(/\d{1,3}/g);

		if (bodyValue) {
			let separator = sisa ? "." : "";
			return headValue + separator + bodyValue.join(".");
		}
		return headValue;
	}

	// Format Float
	formatFloat(v) {
		let value = v == 0 ? 0 : v.replace(/[\.]+/g, "").replace(/[\,]+/g, ".");
		return parseFloat(value)
	}


	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}
}
