import { createAttribute } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { strict } from 'assert';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProductoService } from 'src/app/services/producto.service';

declare var iziToast;
declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-create-pedido',
  templateUrl: './create-pedido.component.html',
  styleUrls: ['./create-pedido.component.css']
})
export class CreatePedidoComponent implements OnInit {

  public carrito_data: any = {
    variedad: '',
  };

  // CLIENTE
  public clientes: Array<any> = [];
  public cliente: any = {};
  public filtroCliente = '';
  public _idCliente = '';

  public load_data = true;
  public token;
  public load_btn = false;
  public filtro = '';

  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';
  public config_global: any = {};

  //CARRITO PEDIDO
  public carrito_arr: Array<any> = [];
  public venta: any = {};
  public dventa: Array<any> = [];
  public page2 = 1;
  public pageSize2 = 4;
  public variedadDetails: Array<any> = [];

  // PRODUCTO
  public page = 1;
  public talla: Array<any> = [
    { name: 'S' },
    { name: 'M' },
    { name: 'L' },
    { name: 'XL' },
  ];
  public pageSize = 4;
  public url;
  public btn_cart = false;
  public producto: any = {
    categoria: ''
  };
  public productos: Array<any> = [];
  public arr_productos: Array<any> = [];

  constructor(
    private _adminService: AdminService,
    private _clienteService: ClienteService,
    private _productoService: ProductoService
  ) {
    this.token = this._adminService.getToken();
    this.url = GLOBAL.url;
    this._adminService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
      }
    );
    // Variedades
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
      response => {
        this.productos = response.data;
        this.productos.forEach(element => {
          this.arr_productos.push({
            titulo: element.titulo,
            _id: element._id,
            stock: element.stock,
            precio: element.precio,
            categoria: element.categoria,
            nventas: element.nventas,
            variedades: element.variedades,
          });
        });
        this.load_data = false;
      },
      error => {
        console.log(error);

      }
    )
  }

  registro(registroForm) {

  }
  // ***************************************************************************************************
  // Cliente
  filtrarCliente() {
    if (this.filtroCliente) {
      this._clienteService.obtener_cliente(this.filtroCliente, this.token).subscribe(
        response => {
          if (response.data == "") {
            this.clientes = undefined;
          } else {
            this.clientes = response.data;
            this._idCliente = response.data[0]._id;
          }

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
      this.clientes = undefined;
    }
  }
  // ***************************************************************************************************
  //CARRITO
  //Obtener Carrito Con Stock
  obtenerPedidoCliente() {
    //GUARDAR DESDE MONGODB
    if (this._idCliente != '') {
      this._clienteService.obtener_carrito_admin(this._idCliente, this.token).subscribe(
        response => {
          this.carrito_arr = response.data;
          // Esto para los detalles
          this.carrito_arr.forEach(element => {
            this.dventa.push({
              producto: element.producto._id,
              subtotal: element.producto.precio,
              variedad: element.variedad,
              cantidad: element.cantidad,
              cliente: this._idCliente
            });
          });
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Aun no ha seleccionado un cliente'
      });
    }
  }
  //Agregar Producto Al carrito (Con Stock)
  agregar_producto(producto, id) {
    //PENDIENTE SABER STOCK SHOW-PRODUCTO
    if (this._idCliente != '') {
      if (this.carrito_data.variedad) {
        let data = {
          producto: producto._id,
          cliente: this._idCliente,
          variedad: this.carrito_data.variedad,
          total: this.producto.total,
          observacion: this.producto.observacion
        }
        this.btn_cart = true;
        setTimeout(() => {
          this._clienteService.agregar_al_carrito(data, this.token).subscribe(
            response => {
              if (response.data == undefined) {
                iziToast.show({
                  title: 'ERROR',
                  titleColor: '#FF0000',
                  color: '#FFF',
                  class: 'text-danger',
                  position: 'topRight',
                  message: 'El producto ya existe en el Pedido'
                });
                this.btn_cart = false;
              } else {
                iziToast.show({
                  title: 'SUCCESS',
                  titleColor: '#1DC74C',
                  color: '#FFF',
                  class: 'text-success',
                  position: 'topRight',
                  message: 'Se agregó el producto al Pedido.'
                });
                this.btn_cart = false;
                $('#select-' + id).modal('hide');
                $('.modal-backdrop').removeClass('show');
                this.init_Data();
              }
            }
          );
        }, 2000);
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Seleccione una variedad de producto'
        });
      }
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un cliente para continuar'
      });
    }
  }
  // Agregar Producto Al carrito (Sin Stock)
  agregar_producto_sin_stock() {
    if (this._idCliente == '') {
      let data = {
        producto: "senciilo",
        precio: this.producto.precio,
        cliente: this._idCliente,
        variedades: this.producto.variedad,
        total: this.producto.total,
        observacion: this.producto.observacion
      }
      console.log(data);
      //CREAMOS EL PRODUCTO
      this.load_btn = true;
      // this._productoService.registro_producto_admin(data, this.file, this.token).subscribe(
      //   response => {
      //     iziToast.show({
      //       title: 'SUCCESS',
      //       titleColor: '#1DC74C',
      //       color: '#FFF',
      //       class: 'text-success',
      //       position: 'topRight',
      //       message: 'El producto se creo, recuerde completar sus datos mas adelante'
      //   }); 
      //   this.load_btn = false;
      //   },error=>{
      //     console.log('Errorr:', error);
      //     this.load_btn = false;
      //   }
      // );
      //CREAMOS LA VARIEDAD DEL PRODUCTO
      // if (data.variedades.length >= 1) {
      //   this._productoService.actualizar_producto_variedades_admin({
      //     titulo_variedad: 'Talla',
      //     variedades: data.variedades
      //   }, 'id',this.token).subscribe(
      //     response=>{
      //       console.log(response);

      //     },error=>{
      //       console.log('ErrVariedad:',error);
      //     }
      //   );
      // } 
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un cliente para continuar'
      });
    }
  }
  //Eliminar del Carrito
  eliminar_item(id) {
    this._clienteService.eliminar_carrito_admin(id, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se eliminó el producto correctamente.'
        });
        this.obtenerPedidoCliente();
      }
    );

  }

  // ***************************************************************************************************
  // PRODUCTO
  filtrarProducto() {
    if (this.filtro) {
      this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
        response => {
          // console.log(response);
          this.productos = response.data;
          this.load_data = false;
        },
        error => {
          console.log(error);

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

  resetar() {
    this.filtro = '';
    this.init_Data();
  }

  total_sin_stock() {
    if (this.producto.variedad) {
      let cantidades = this.producto.variedad.reduce((acum, talla) => {
        if (talla.cantidad) {
          return acum + talla.cantidad
        }
        return acum;
      }, 0);
      this.producto.total = cantidades * this.producto.precio;
    }
  }

  total_con_stock(precio) {
    if (this.carrito_data.variedad) {
      let cantidades = this.carrito_data.variedad.reduce((acum, talla) => {
        if (talla.cantidad) {
          return acum + talla.cantidad
        }
        return acum;
      }, 0);
      this.producto.total = cantidades * precio;
    }
  }

  
  fileChangeEvent(event:any):void{
    var file;
    if(event.target.files && event.target.files[0]){
      file = <File>event.target.files[0];
    }else{
      iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'No hay un imagen de envio'
      });
    }

    if(file.size <= 4000000){
      if(file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg'){
        const reader = new FileReader();
        reader.onload = e => this.imgSelect = reader.result;
        // console.log(this.imgSelect);
        reader.readAsDataURL(file);
        $('#input-portada').text(file.name);
        this.file = file;
      }else{
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
    }else{
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
