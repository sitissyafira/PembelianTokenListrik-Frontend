import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class ServiceFormat {
	constructor(private http: HttpClient) { }

	// Format Rupiah (Rp. )
	rupiahFormatImprovement(x) {
		// Float with accounting format
		if (x % 1 != 0) {
			if (x < 0) {
				let num2Str = x.toString();
				let spl = num2Str.split("");
				spl.shift();
				let joi = spl.join("");
				let xStr0 = joi.toString().split("."),
					dec0 = xStr0[1].substr(0, 2),
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
				dec0 = xStr0[1].substr(0, 2),
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


	// Format float convert string to number Float
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

	terbilang(nominal) {
		console.log(typeof(nominal), 'nominal type')
		var bilangan = nominal.toString();
		var kalimat = "";
		if (nominal == 0) kalimat = "Nol";
		var angka = new Array("0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0");
		var kata = new Array("", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan");
		var tingkat = new Array("", "Ribu", "Juta", "Milyar", "Triliun");
		var panjang_bilangan = bilangan.length;

		console.log(panjang_bilangan, 'pjg')

		/* pengujian panjang bilangan */
		if (panjang_bilangan > 15) {
			kalimat = "-";
		} else {
			/* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
			for (i = 1; i <= panjang_bilangan; i++) {
			angka[i] = bilangan.substr(-i, 1);
			}
			console.log(angka[i], 'angka i')

			var i = 1;
			var j = 0;

			/* mulai proses iterasi terhadap array angka */
			while (i <= panjang_bilangan) {
			var subkalimat = "";
			var kata1 = "";
			var kata2 = "";
			var kata3 = "";

			/* untuk Ratusan */
			if (angka[i + 2] != "0") {
				if (angka[i + 2] == "1") {
				kata1 = "Seratus";
				} else {
				kata1 = kata[angka[i + 2]] + " Ratus";
				}
			}
			console.log(kata1, 'kata1')

			/* untuk Puluhan atau Belasan */
			if (angka[i + 1] != "0") {
				if (angka[i + 1] == "1") {
				if (angka[i] == "0") {
					kata2 = "Sepuluh";
				} else if (angka[i] == "1") {
					kata2 = "Sebelas";
				} else {
					kata2 = kata[angka[i]] + " Belas";
				}
				} else {
				kata2 = kata[angka[i + 1]] + " Puluh";
				}
			}
			console.log(kata2, 'kata2')

			/* untuk Satuan */
			if (angka[i] != "0") {
				if (angka[i + 1] != "1") {
				kata3 = kata[angka[i]];
				}
			}
			console.log(kata3, 'kata3')

			/* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
			if (angka[i] != "0" || angka[i + 1] != "0" || angka[i + 2] != "0") {
				subkalimat = kata1 + " " + kata2 + " " + kata3 + " " + tingkat[j] + " ";
			}

			console.log(subkalimat, 'subkalimat')
			/* gabungkan variabe sub kalimat (untuk Satu blok 3 angka) ke variabel kalimat */
			kalimat = subkalimat + kalimat;
			i = i + 3;
			j = j + 1;
			}

			console.log(kalimat, 'kalimat')

			/* mengganti Satu Ribu jadi Seribu jika diperlukan */
			if (angka[5] == "0" && angka[6] == "0") {
			kalimat = kalimat.replace("Satu Ribu", "Seribu");
			}

			console.log(kalimat, 'kalimat 2')
		}
		const result = kalimat.replace(/\s+/g, " ").trim() + " Rupiah";
		console.log(kalimat, 'result');

		return result;
	}
}
