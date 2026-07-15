import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProductoService } from 'src/app/services/producto.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, SlicePipe, NgClass, CurrencyPipe } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';


declare var iziToast;
declare var jQuery: any;
declare var $: any;

@Component({
    selector: 'app-create-pedido',
    templateUrl: './create-pedido.component.html',
    styleUrls: ['./create-pedido.component.css'],
    imports: [SidebarComponent, FormsModule, NgIf, NgFor, NgSelectComponent, NgbPagination, SlicePipe, NgClass, CurrencyPipe]
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
  public cliente_seleccionado: any = undefined;
  public direcciones: Array<any> = [];
  public direccion_seleccionada: any = undefined;
  public nuevo_cliente: any = { genero: '' };
  public nueva_direccion: any = { pais: 'Perú' };
  public load_btn_cliente = false;
  public load_btn_direccion = false;

  public load_data = true;
  public token;
  public load_btn = false;
  public filtro = '';
  // DETALLES DE PAGO Y ENVIO
  public transaccion: string = 'Efectivo';
  public envio_titulo: string = 'Recogida en Tienda';
  public envio_precio: number = 0;

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
    private _productoService: ProductoService,
    private _router: Router
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
    if (this._idCliente != '') {
      this._clienteService.obtener_carrito_admin(this._idCliente, this.token).subscribe(
        response => {
          this.carrito_arr = response.data;
          this.dventa = [];
          
          this.carrito_arr.forEach(element => {
            if (Array.isArray(element.variedad)) {
              element.variedad.forEach(varItem => {
                this.dventa.push({
                  producto: element.producto._id,
                  subtotal: element.producto.precio * varItem.cantidad,
                  variedad: varItem.titulo,
                  cantidad: varItem.cantidad,
                  cliente: this._idCliente
                });
              });
            } else {
              this.dventa.push({
                producto: element.producto._id,
                subtotal: element.producto.precio * element.cantidad,
                variedad: element.variedad,
                cantidad: element.cantidad,
                cliente: this._idCliente
              });
            }
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
        message: 'Aún no ha seleccionado un cliente'
      });
    }
  }
  //Agregar Producto Al carrito (Con Stock)
  agregar_producto(producto, id) {
    if (this._idCliente != '') {
      if (this.carrito_data.variedad && this.carrito_data.variedad.length > 0) {
        let selectedVarieties = this.carrito_data.variedad.filter(v => v.cantidad > 0);
        if (selectedVarieties.length == 0) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Ingrese cantidad válida para al menos una variedad'
          });
          return;
        }

        let total_item_amount = selectedVarieties.reduce((sum, v) => sum + (v.cantidad * producto.precio), 0);

        let data = {
          producto: producto._id,
          cliente: this._idCliente,
          variedad: selectedVarieties,
          total: total_item_amount,
          observacion: this.producto.observacion || ''
        };
        this.btn_cart = true;
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
              this.carrito_data = { variedad: '' };
              this.producto.total = 0;
              this.producto.observacion = '';

              $('#select-' + id).modal('hide');
              $('.modal-backdrop').removeClass('show');
              this.obtenerPedidoCliente();
            }
          },
          error => {
            this.btn_cart = false;
            console.log(error);
          }
        );
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Seleccione una variedad de producto y especifique cantidades'
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
    if (this._idCliente != '') {
      if (!this.producto.nombre) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Ingrese el nombre del producto'
        });
        return;
      }
      if (!this.producto.precio || this.producto.precio <= 0) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Ingrese un precio válido'
        });
        return;
      }
      if (!this.file) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Debe subir una imagen de portada'
        });
        return;
      }

      let total_stock = 0;
      if (this.producto.variedad) {
        total_stock = this.producto.variedad.reduce((sum, v) => sum + (v.cantidad || 0), 0);
      }

      if (total_stock <= 0) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Debe ingresar cantidad para al menos una talla'
        });
        return;
      }

      let data = {
        titulo: this.producto.nombre,
        stock: total_stock,
        precio: this.producto.precio,
        precio_cop: 0,
        descripcion: this.producto.observacion || 'Producto sin stock',
        contenido: 'Producto especial sin stock',
        categoria: 'Sin Stock'
      };

      this.load_btn = true;
      this._productoService.registro_producto_admin(data, this.file, this.token).subscribe(
        response => {
          if (response.data != undefined) {
            let createdProduct = response.data;
            let varietiesToSave = this.producto.variedad.filter(v => v.cantidad > 0).map(v => ({ titulo: v.name }));

            this._productoService.actualizar_producto_variedades_admin({
              titulo_variedad: 'Talla',
              variedades: varietiesToSave
            }, createdProduct._id, this.token).subscribe(
              varResponse => {
                let varietiesForCart = this.producto.variedad.filter(v => v.cantidad > 0).map(v => ({
                  titulo: v.name,
                  cantidad: v.cantidad
                }));

                let cartData = {
                  producto: createdProduct._id,
                  cliente: this._idCliente,
                  variedad: varietiesForCart,
                  total: this.producto.total,
                  observacion: this.producto.observacion || ''
                };

                this._clienteService.agregar_al_carrito(cartData, this.token).subscribe(
                  cartResponse => {
                    iziToast.show({
                      title: 'SUCCESS',
                      titleColor: '#1DC74C',
                      color: '#FFF',
                      class: 'text-success',
                      position: 'topRight',
                      message: 'El producto sin stock se creó y se agregó al pedido.'
                    });

                    this.load_btn = false;
                    $('#select-stock').modal('hide');
                    $('.modal-backdrop').removeClass('show');

                    this.producto = { categoria: '' };
                    this.imgSelect = 'assets/img/01.jpg';
                    this.file = undefined;

                    this.init_Data();
                    this.obtenerPedidoCliente();
                  },
                  cartError => {
                    console.log('Error al agregar al carrito:', cartError);
                    this.load_btn = false;
                  }
                );
              },
              varError => {
                console.log('Error al actualizar variedades:', varError);
                this.load_btn = false;
              }
            );
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: 'No se pudo crear el producto.'
            });
            this.load_btn = false;
          }
        },
        error => {
          console.log('Error al registrar producto:', error);
          this.load_btn = false;
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe seleccionar un cliente antes de agregar un producto sin stock'
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


  // Métodos de selección y registro para flujo POS
  seleccionar_cliente(item: any) {
    this.cliente_seleccionado = item;
    this._idCliente = item._id;
    this.filtroCliente = '';
    this.clientes = [];
    this.obtener_direcciones_cliente();
    this.obtenerPedidoCliente();
  }

  deseleccionar_cliente() {
    this.cliente_seleccionado = undefined;
    this._idCliente = '';
    this.direcciones = [];
    this.direccion_seleccionada = undefined;
    this.carrito_arr = [];
    this.dventa = [];
    this.transaccion = 'Efectivo';
    this.envio_titulo = 'Recogida en Tienda';
    this.envio_precio = 0;
  }

  obtener_direcciones_cliente() {
    if (this._idCliente) {
      this._clienteService.obtener_direccion_todos_cliente(this._idCliente, this.token).subscribe(
        response => {
          this.direcciones = response.data || [];
          if (this.direcciones.length > 0) {
            const principal = this.direcciones.find(d => d.principal);
            this.direccion_seleccionada = principal ? principal : this.direcciones[0];
          } else {
            this.direccion_seleccionada = undefined;
          }
        }
      );
    }
  }

  seleccionar_direccion(dir: any) {
    this.direccion_seleccionada = dir;
  }

  registrar_cliente_modal(form: any) {
    if (form.valid) {
      this.load_btn_cliente = true;
      this._clienteService.registro_cliente_admin(this.nuevo_cliente, this.token).subscribe(
        response => {
          if (response.data != undefined) {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se registró correctamente el nuevo cliente.'
            });
            let clientCreated = response.data;
            this.seleccionar_cliente(clientCreated);
            this.nuevo_cliente = { genero: '' };
            this.load_btn_cliente = false;
            $('#create-cliente-modal').modal('hide');
            $('.modal-backdrop').removeClass('show');
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message || 'Error al registrar cliente.'
            });
            this.load_btn_cliente = false;
          }
        },
        error => {
          console.log(error);
          this.load_btn_cliente = false;
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Complete los datos obligatorios.'
      });
    }
  }

  registrar_direccion_modal(form: any) {
    if (form.valid && this._idCliente) {
      this.load_btn_direccion = true;
      this.nueva_direccion.cliente = this._idCliente;
      this.nueva_direccion.principal = this.direcciones.length == 0;

      this._clienteService.registro_direccion_cliente(this.nueva_direccion, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Dirección agregada correctamente.'
          });

          this.nueva_direccion = { pais: 'Perú' };
          this.load_btn_direccion = false;
          $('#create-direccion-modal').modal('hide');
          $('.modal-backdrop').removeClass('show');

          this.obtener_direcciones_cliente();
        },
        error => {
          console.log(error);
          this.load_btn_direccion = false;
        }
      );
    } else {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Complete los datos obligatorios.'
      });
    }
  }

  finalizar_pedido() {
    if (!this._idCliente) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe seleccionar un cliente'
      });
      return;
    }
    if (!this.direccion_seleccionada) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe registrar o seleccionar una dirección de envío'
      });
      return;
    }
    if (this.carrito_arr.length == 0) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'El pedido no tiene productos'
      });
      return;
    }

    let subtotal_venta = this.carrito_arr.reduce((sum, item) => sum + (item.total || 0), 0);

    let ventaData = {
      cliente: this._idCliente,
      subtotal: subtotal_venta + Number(this.envio_precio),
      envio_titulo: this.envio_titulo,
      envio_precio: Number(this.envio_precio),
      transaccion: this.transaccion,
      cupon: 'No',
      estado: 'Procesando',
      direccion: this.direccion_seleccionada._id,
      nota: this.producto.observacion || 'Manual admin order',
      detalles: this.dventa
    };

    this.load_btn = true;
    this._adminService.registro_compra_cliente(ventaData, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se registró correctamente el pedido.'
        });

        this.deseleccionar_cliente();
        this.load_btn = false;
        this._router.navigate(['/panel/pedidos']);
      },
      error => {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al finalizar el pedido.'
        });
        this.load_btn = false;
        console.log(error);
      }
    );
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
        message: 'No hay una imagen de portada'
      });
    }

    if (file && file.size <= 4000000) {
      if (file.type == 'image/png' || file.type == 'image/webp' || file.type == 'image/jpg' || file.type == 'image/gif' || file.type == 'image/jpeg') {
        const reader = new FileReader();
        reader.onload = e => this.imgSelect = reader.result;
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
    } else if (file) {
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
  }

  calcular_subtotal() {
    return this.carrito_arr.reduce((sum, item) => sum + (item.total || 0), 0);
  }
}
