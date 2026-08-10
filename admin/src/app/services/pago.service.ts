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

  listar_comprobantes_admin(estado: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    const queryParam = estado ? `?estado=${estado}` : '';
    return this._http.get(this.url + 'listar_comprobantes_admin' + queryParam, { headers: headers });
  }

  evaluar_comprobante_admin(id: string, data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'evaluar_comprobante_admin/' + id, data, { headers: headers });
  }
}
