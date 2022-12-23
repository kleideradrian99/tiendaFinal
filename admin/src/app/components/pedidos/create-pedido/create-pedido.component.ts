import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

declare var iziToast;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-create-pedido',
  templateUrl: './create-pedido.component.html',
  styleUrls: ['./create-pedido.component.css']
})
export class CreatePedidoComponent implements OnInit {


  public cliente: any = {
    genero: ''
  };
  public token;
  public load_btn = false;
  public filtro = '';
  public producto: any = {
    categoria: ''
  };
  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config_global: any = {};

  constructor(
    private _adminService: AdminService,
  ) {

    this._adminService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
        console.log(this.config_global);
      }
    );
  }

  ngOnInit(): void {
  }

  registro(registroForm) {

  }

  filtrar() {
    // this._cuponService.listar_cupones_admin(this.filtro,this.token).subscribe(
    //   response=>{
    //     this.cupones = response.data;
    //     this.load_data = false;
    //   }
    // )
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
