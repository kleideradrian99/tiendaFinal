import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgIf, NgFor, SlicePipe, DatePipe, NgClass, CurrencyPipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { RouterLink } from '@angular/router';

declare var iziToast;
declare var $;

@Component({
    selector: 'app-index-contacto',
    templateUrl: './index-contacto.component.html',
    styleUrls: ['./index-contacto.component.css'],
    imports: [SidebarComponent, NgIf, NgFor, NgbPagination, SlicePipe, DatePipe, FormsModule, NgClass, CurrencyPipe, RouterLink]
})
export class IndexContactoComponent implements OnInit {

  public mensajes : Array<any> =[];
  public load_data = true;
  public page = 1;
  public pageSize = 20;
  public filtro = '';
  public token;
  public url;

  public load_btn = false;
  
  // Soporte y Hilo de Discusión (Módulo 13)
  public ticket_seleccionado: any = null;
  public respuesta_txt = '';
  public load_btn_respuesta = false;

  constructor(
    private _adminService:AdminService
  ) { 
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data(){
    this._adminService.obtener_mensajes_admin(this.token).subscribe(
      response=>{
        this.mensajes = response.data;
        this.load_data = false;
      }
    );
  }

  seleccionar_ticket(id){
    this._adminService.obtener_ticket_admin(id, this.token).subscribe(
      response => {
        this.ticket_seleccionado = response.data;
      }
    );
  }

  deseleccionar_ticket(){
    this.ticket_seleccionado = null;
  }

  responder_ticket() {
    if (!this.respuesta_txt) return;
    this.load_btn_respuesta = true;
    const data = {
      mensaje: this.respuesta_txt,
      estado: this.ticket_seleccionado.estado
    };
    this._adminService.responder_ticket_admin(this.ticket_seleccionado._id, data, this.token).subscribe(
      response => {
        this.respuesta_txt = '';
        this.load_btn_respuesta = false;
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Respuesta enviada al cliente.'
        });
        this.seleccionar_ticket(this.ticket_seleccionado._id);
        this.init_Data();
      },
      error => {
        this.load_btn_respuesta = false;
        console.error(error);
      }
    );
  }

  actualizar_estado_ticket(estado) {
    this.ticket_seleccionado.estado = estado;
    this._adminService.responder_ticket_admin(this.ticket_seleccionado._id, { estado: estado, mensaje: 'Cambio de estado a: ' + estado }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Estado del ticket actualizado.'
        });
        this.seleccionar_ticket(this.ticket_seleccionado._id);
        this.init_Data();
      }
    );
  }

  cerrar(id){
    this.load_btn = true;
    this._adminService.cerrar_mensaje_admin(id,{data:undefined},this.token).subscribe(
      response=>{
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se cerró correctamente el mensaje.'
        });

        $('#estadoModal-'+id).modal('hide');
        $('.modal-backdrop').removeClass('show');

        this.init_Data();
        this.load_btn = false;
        
      },
      error=>{
        console.log(error);
        
      }
    )
  }
}
