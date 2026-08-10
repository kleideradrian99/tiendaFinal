import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  registro_proveedor_admin(data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registro_proveedor_admin', data, { headers: headers });
  }

  listar_proveedores_admin(token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_proveedores_admin', { headers: headers });
  }

  obtener_proveedor_admin(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_proveedor_admin/' + id, { headers: headers });
  }

  actualizar_proveedor_admin(id: string, data: any, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_proveedor_admin/' + id, data, { headers: headers });
  }

  eliminar_proveedor_admin(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_proveedor_admin/' + id, { headers: headers });
  }
}
