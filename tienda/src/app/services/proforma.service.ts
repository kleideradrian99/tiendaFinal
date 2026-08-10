import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProformaService {

  public url;

  constructor(
    private _http: HttpClient,
  ) { 
    this.url = GLOBAL.url;
  }

  solicitar_proforma_cliente(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'solicitar_proforma_cliente', data, { headers: headers });
  }

  listar_proformas_cliente(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_proformas_cliente', { headers: headers });
  }

  obtener_detalle_proforma_cliente(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_detalle_proforma_cliente/' + id, { headers: headers });
  }

  obtener_tarifa_envio_cliente(peso, pais, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_tarifa_envio/' + peso + '/' + pais, { headers: headers });
  }

  procesar_proforma_venta(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'procesar_proforma_venta', data, { headers: headers });
  }
}
