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

  listar_proformas_admin(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_proformas_admin', { headers: headers });
  }

  obtener_proforma_admin(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_detalle_proforma_cliente/' + id, { headers: headers });
  }

  actualizar_proforma_admin(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_proforma_admin/' + id, data, { headers: headers });
  }
}
