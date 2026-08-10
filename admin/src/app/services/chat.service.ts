import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GLOBAL } from './GLOBAL';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  listar_conversaciones_asesor(token: string): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_conversaciones_asesor', { headers: headers });
  }

  listar_mensajes_asesor(clienteId: string, token: string): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_mensajes_asesor/' + clienteId, { headers: headers });
  }

  enviar_mensaje_asesor(data: any, token: string): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.post(this.url + 'enviar_mensaje_asesor', data, { headers: headers });
  }
}
