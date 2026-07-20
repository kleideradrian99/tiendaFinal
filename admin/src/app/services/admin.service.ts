import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  login_admin(data): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(this.url + 'login_admin', data, { headers: headers });
  }

  getToken() {
    return localStorage.getItem('token');
  }


  public isAuthenticated(allowRoles: string[]): boolean {

    const token = localStorage.getItem('token');


    if (!token) {
      return false;
    }

    try {
      const helper = new JwtHelperService();
      var decodedToken = helper.decodeToken(token);

      if (helper.isTokenExpired(token)) {
        localStorage.clear();
        return false;
      }

      if (!decodedToken) {
        console.log('NO ES VALIDO');
        localStorage.removeItem('token');
        return false;
      }
    } catch (error) {
      localStorage.removeItem('token');
      return false;
    }


    return allowRoles.includes(decodedToken['role']);
  }

  actualiza_config_admin(id, data, token): Observable<any> {
    if (data.logo) {
      let headers = new HttpHeaders({ 'Authorization': token });

      const fd = new FormData();
      fd.append('titulo', data.titulo);
      fd.append('serie', data.serie);
      fd.append('correlativo', data.correlativo);
      fd.append('categorias', JSON.stringify(data.categorias));
      fd.append('logo', data.logo);
      return this._http.put(this.url + 'actualiza_config_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualiza_config_admin/' + id, data, { headers: headers });
    }

  }

  obtener_config_admin(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_config_admin', { headers: headers });
  }

  obtener_config_publico(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_config_publico', { headers: headers });
  }

  obtener_mensajes_admin(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_mensajes_admin', { headers: headers });
  }

  cerrar_mensaje_admin(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'cerrar_mensaje_admin/' + id, data, { headers: headers });
  }

  obtener_ventas_admin(desde, hasta, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_ventas_admin/' + desde + '/' + hasta, { headers: headers });
  }

  obtener_detalles_ordenes_cliente(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_detalles_ordenes_cliente/' + id, { headers: headers });
  }


  //KPI
  kpi_ganancias_mensuales_admin(token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'kpi_ganancias_mensuales_admin', { headers: headers });
  }

  registro_compra_cliente(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registro_compra_cliente', data, { headers: headers });
  }

  actualizar_estado_venta_admin(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_estado_venta_admin/' + id, data, { headers: headers });
  }

  actualizar_pedido_admin(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_pedido_admin/' + id, data, { headers: headers });
  }

  registrar_usuario_interno(data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'registrar_usuario_interno', data, { headers: headers });
  }

  listar_usuarios_internos(filtro, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_usuarios_internos/' + filtro, { headers: headers });
  }

  obtener_usuario_interno(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_usuario_interno/' + id, { headers: headers });
  }

  actualizar_usuario_interno(id, data, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(this.url + 'actualizar_usuario_interno/' + id, data, { headers: headers });
  }

  eliminar_usuario_interno(id, token): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_usuario_interno/' + id, { headers: headers });
  }

  enviar_recuperacion_admin(data): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.url + 'enviar_recuperacion_admin', data, { headers: headers });
  }

  restablecer_contrasena_admin(data): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(this.url + 'restablecer_contrasena_admin', data, { headers: headers });
  }
}
