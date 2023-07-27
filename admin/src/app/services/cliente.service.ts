import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JsonPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  listar_clientes_filtro_admin(tipo, filtro, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_clientes_filtro_admin/' + tipo + '/' + filtro, { headers: headers });
  }

  registro_cliente_admin(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registro_cliente_admin', data, { headers: headers });
  }

  obtener_cliente_admin(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_cliente_admin/' + id, { headers: headers });
  }

  //Obtener Cliente por DNI
  obtener_cliente(filtro, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_cliente/' + filtro, { headers: headers });
  }

  actulizar_cliente_admin(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actulizar_cliente_admin/' + id, data, { headers: headers });
  }

  eliminar_cliente_admin(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_cliente_admin/' + id, { headers: headers });
  }

  //Carrito de Pedido Productos con Stock
  agregar_carrito_cliente(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'agregar_carrito_cliente', data, { headers: headers });
  }

  eliminar_carrito_cliente(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_carrito_cliente/' + id, { headers: headers });
  }

  obtener_carrito_cliente(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_carrito_cliente/' + id, { headers: headers });
  }

  //Carrito de Pedido Productos sin Stock

  agregar_al_carrito(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'agregar_al_carrito', data, { headers: headers });
  }

  obtener_carrito_admin(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'obtener_carrito_admin/' + id, { headers: headers });
  }

  obtener_ordenes(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_ordenes/', { headers: headers });
  }

  eliminar_carrito_admin(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'eliminar_carrito_admin/' + id, { headers: headers });
  }


}
