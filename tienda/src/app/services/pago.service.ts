import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  registrar_comprobante_cliente(data: any, file: File, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': token });
    const formData = new FormData();
    
    formData.append('proforma', data.proforma);
    formData.append('monto', data.monto.toString());
    formData.append('moneda', data.moneda);
    formData.append('trm', data.trm.toString());
    formData.append('fecha_pago', data.fecha_pago);
    formData.append('cuenta_destino', data.cuenta_destino);
    if (data.observaciones) {
      formData.append('observaciones', data.observaciones);
    }
    formData.append('comprobante', file);

    return this._http.post(this.url + 'registrar_comprobante_cliente', formData, { headers: headers });
  }

  obtener_comprobantes_cliente(token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_comprobantes_cliente', { headers: headers });
  }
}
