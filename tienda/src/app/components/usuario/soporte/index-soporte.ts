import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { NavComponent } from '../../nav/nav.component';
import { SiderbarComponent } from '../siderbar/siderbar.component';
import { NgIf, NgFor, SlicePipe, DatePipe, NgClass, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GLOBAL } from 'src/app/services/GLOBAL';

declare var iziToast;

@Component({
  selector: 'app-index-soporte',
  templateUrl: './index-soporte.html',
  styleUrls: ['./index-soporte.css'],
  imports: [NavComponent, SiderbarComponent, NgIf, NgFor, RouterLink, FormsModule, NgClass, DatePipe, CurrencyPipe]
})
export class IndexSoporteComponent implements OnInit {
  public token;
  public id_cliente;
  public load_data = true;
  public tickets: Array<any> = [];
  public ordenes: Array<any> = [];
  public url;

  public nuevo_ticket = {
    asunto: 'Defecto en confección',
    mensaje: '',
    venta: ''
  };
  
  public ticket_seleccionado: any = null;
  public respuesta_txt = '';
  public file: File = undefined;
  public load_btn = false;

  constructor(private _clienteService: ClienteService) {
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    if (this.token && this.id_cliente) {
      this.init_data();
      this.cargar_ordenes();
    }
  }

  init_data() {
    this.load_data = true;
    this._clienteService.listar_tickets_cliente(this.token).subscribe(
      response => {
        this.tickets = response.data || [];
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  cargar_ordenes() {
    this._clienteService.obtener_ordenes_cliente(this.id_cliente, this.token).subscribe(
      response => {
        this.ordenes = response.data || [];
      }
    );
  }

  crear_ticket() {
    if (!this.nuevo_ticket.mensaje) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un mensaje detallando el problema.'
      });
      return;
    }

    this.load_btn = true;
    this._clienteService.registro_ticket_cliente(this.nuevo_ticket, this.token).subscribe(
      response => {
        const ticketCreated = response.data;
        
        if (this.file) {
          this._clienteService.subir_evidencia_ticket_cliente(ticketCreated._id, this.file, this.token).subscribe(
            resUpload => {
              this.finalizar_registro_ticket();
            }
          );
        } else {
          this.finalizar_registro_ticket();
        }
      },
      error => {
        this.load_btn = false;
        console.error(error);
      }
    );
  }

  finalizar_registro_ticket() {
    iziToast.show({
      title: 'ÉXITO',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: 'Ticket de novedad creado exitosamente.'
    });
    this.nuevo_ticket = { asunto: 'Defecto en confección', mensaje: '', venta: '' };
    this.file = undefined;
    this.load_btn = false;
    this.init_data();
  }

  fileChangeEvent(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
    } else {
      this.file = undefined;
    }
  }

  seleccionar_ticket(id) {
    this._clienteService.obtener_ticket_cliente(id, this.token).subscribe(
      response => {
        this.ticket_seleccionado = response.data;
      }
    );
  }

  deseleccionar_ticket() {
    this.ticket_seleccionado = null;
  }

  enviar_respuesta() {
    if (!this.respuesta_txt) return;
    this.load_btn = true;
    this._clienteService.responder_ticket_cliente(this.ticket_seleccionado._id, { mensaje: this.respuesta_txt }, this.token).subscribe(
      response => {
        this.respuesta_txt = '';
        this.load_btn = false;
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Respuesta enviada.'
        });
        this.seleccionar_ticket(this.ticket_seleccionado._id);
      },
      error => {
        this.load_btn = false;
        console.error(error);
      }
    );
  }
}
