import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';

declare var iziToast;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-create-pedido',
  templateUrl: './create-pedido.component.html',
  styleUrls: ['./create-pedido.component.css']
})
export class CreatePedidoComponent implements OnInit {

  public clientes: Array<any> = [];
  public cliente: any = {
    genero: ''
  };

  public load_data = true;
  public token;
  public load_btn = false;
  public filtro = '';
  public productos: Array<any> = [];
  public producto: any = {
    categoria: ''
  };
  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config_global: any = {};

  constructor(
    private _adminService: AdminService,
    private _clienteService: ClienteService,
  ) {
    this.token = this._adminService.getToken();
    this._adminService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
        console.log(this.config_global);
      }
    );
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    //Cargamos los clientes en BD
    this._clienteService.listar_clientes_filtro_admin(null, null, this.token).subscribe(
      response => {
        this.clientes = response.data;
        this.load_data = false;
        console.log("Estos son los clientes " + this.clientes)
      },
      error => {
        console.log(error);
      }
    );
  }

  registro(registroForm) {

  }

  filtrar() {
    if (this.filtro) {
      this._clienteService.obtener_cliente(this.filtro, this.token).subscribe(
        response => {
          this.productos = response.data;
          console.log(this.productos);
        }
      )
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese un filtro para buscar'
      });
    }
  }

  fileChangeEvent(event: any): void {
    var file;
    if (event.target.files && event.target.files[0]) {
      file = <File>event.target.files[0];


    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'No hay un imagen de envio'
      });
    }

    if (file.size <= 4000000) {

      if (file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg') {

        const reader = new FileReader();
        reader.onload = e => this.imgSelect = reader.result;
        console.log(this.imgSelect);

        reader.readAsDataURL(file);

        $('#input-portada').text(file.name);
        this.file = file;

      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'El archivo debe ser una imagen'
        });
        $('#input-portada').text('Seleccionar imagen');
        this.imgSelect = 'assets/img/01.jpg';
        this.file = undefined;
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'La imagen no puede superar los 4MB'
      });
      $('#input-portada').text('Seleccionar imagen');
      this.imgSelect = 'assets/img/01.jpg';
      this.file = undefined;
    }

    console.log(this.file);

  }
}
