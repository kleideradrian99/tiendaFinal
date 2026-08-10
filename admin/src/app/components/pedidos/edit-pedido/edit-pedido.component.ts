import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { ProductoService } from 'src/app/services/producto.service';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, SlicePipe, NgClass, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

declare var iziToast: any;
declare var $: any;

@Component({
    selector: 'app-edit-pedido',
    templateUrl: './edit-pedido.component.html',
    styleUrls: ['./edit-pedido.component.css'],
    imports: [SidebarComponent, FormsModule, NgIf, NgFor, NgSelectComponent, NgbPagination, RouterLink, SlicePipe, NgClass, CurrencyPipe, DatePipe, DecimalPipe]
})
export class EditPedidoComponent implements OnInit {

  public id: string = '';
  public token: any;
  public url: any;
  public load_data = true;
  public load_btn = false;

  // Nuevas propiedades de Gestión y Logística (Módulo 9 y 10/11)
  public venta: any = {};
  public eval_estado_data: any = {
    estado: '',
    motivo: '',
    notas_internas: ''
  };
  public load_btn_estado = false;
  
  public proveedores: Array<any> = [];
  public empaque_data: any = {
    peso_real: 0,
    dimensiones_alto: 0,
    dimensiones_ancho: 0,
    dimensiones_largo: 0,
    ncajas: 1,
    tracking_fedex: ''
  };
  public load_btn_empaque = false;

  public escala_data: any = {
    estado: '',
    ubicacion: '',
    descripcion: ''
  };
  public load_btn_escala = false;
  
  // CLIENTE
  public clientes: Array<any> = [];
  public cliente: any = {};
  public filtroCliente = '';
  public filtro = '';
  public _idCliente = '';
  public cliente_seleccionado: any = undefined;
  public direcciones: Array<any> = [];
  public direccion_seleccionada: any = undefined;
  public nuevo_cliente: any = { genero: '' };
  public nueva_direccion: any = { pais: 'Perú' };
  public load_btn_cliente = false;
  public load_btn_direccion = false;

  // DETALLES DE PAGO Y ENVIO
  public transaccion: string = 'Efectivo';
  public envio_titulo: string = 'Recogida en Tienda';
  public envio_precio: number = 0;

  // CARRITO PEDIDO (EN MEMORIA)
  public carrito_arr: Array<any> = [];
  public dventa: Array<any> = [];
  public config_global: any = {};

  // PRODUCTO
  public page = 1;
  public pageSize = 4;
  public talla: Array<any> = [
    { name: 'S' },
    { name: 'M' },
    { name: 'L' },
    { name: 'XL' },
  ];
  public productos: Array<any> = [];
  public arr_productos: Array<any> = [];
  public btn_cart = false;
  public producto: any = { categoria: '' };
  public carrito_data: any = { variedad: '' };
  
  public file: File = undefined;
  public imgSelect: any | ArrayBuffer = 'assets/img/01.jpg';

  constructor(
    private _route: ActivatedRoute,
    private _adminService: AdminService,
    private _clienteService: ClienteService,
    private _productoService: ProductoService,
    private _router: Router,
    private _proveedorService: ProveedorService
  ) {
    this.token = this._adminService.getToken();
    this.url = GLOBAL.url;
    this._adminService.obtener_config_publico().subscribe(
      response => {
        this.config_global = response.data;
      }
    );
  }

  ngOnInit(): void {
    if (this.token) {
      this.listar_proveedores();
    }
    this._route.params.subscribe(params => {
      this.id = params['id'];
      this.init_Data();
    });
  }

  init_Data() {
    this.load_data = true;
    // 1. Listar catálogo
    this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
      response => {
        this.productos = response.data || [];
        this.arr_productos = [];
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

        // 2. Obtener detalles de la orden
        this._adminService.obtener_detalles_ordenes_cliente(this.id, this.token).subscribe(
          ordResponse => {
            if (ordResponse.data != undefined) {
              this.venta = ordResponse.data;
              let detalles = ordResponse.detalles || [];
              
              this.eval_estado_data.estado = this.venta.estado;
              this.eval_estado_data.notas_internas = this.venta.notas_internas || '';
              this.cliente_seleccionado = this.venta.cliente;
              this._idCliente = this.venta.cliente._id;
              this.producto.observacion = this.venta.nota || '';
              this.transaccion = this.venta.transaccion || 'Efectivo';
              this.envio_titulo = this.venta.envio_titulo || 'Recogida en Tienda';
              this.envio_precio = this.venta.envio_precio || 0;

              // Cargar direcciones del cliente
              this._clienteService.obtener_direccion_todos_cliente(this._idCliente, this.token).subscribe(
                dirResponse => {
                  this.direcciones = dirResponse.data || [];
                  this.direccion_seleccionada = this.direcciones.find(d => d._id === this.venta.direccion?._id) || this.direcciones.find(d => d.principal) || this.direcciones[0];
                }
              );

              this.empaque_data = {
                peso_real: this.venta.peso_real || 0,
                dimensiones_alto: this.venta.dimensiones_alto || 0,
                dimensiones_ancho: this.venta.dimensiones_ancho || 0,
                dimensiones_largo: this.venta.dimensiones_largo || 0,
                ncajas: this.venta.ncajas || 1,
                tracking_fedex: this.venta.tracking_fedex || ''
              };

              // Agrupar detalles planos (Dventa) por producto
              let grouped: any = {};
              detalles.forEach((det: any) => {
                if (det.producto) {
                  let prodId = det.producto._id;
                  if (!grouped[prodId]) {
                    grouped[prodId] = {
                      _id: det._id,
                      producto: det.producto,
                      variedad: [],
                      total: 0
                    };
                  }
                  grouped[prodId].variedad.push({
                    _id: det._id,
                    titulo: det.variedad,
                    cantidad: det.cantidad,
                    estado: det.estado || 'Solicitado',
                    proveedor: det.proveedor?._id || '',
                    costo_compra: det.costo_compra || 0,
                    fecha_estimada_acopio: det.fecha_estimada_acopio ? new Date(det.fecha_estimada_acopio).toISOString().substring(0, 10) : ''
                  });
                  grouped[prodId].total += det.subtotal;
                }
              });
              
              this.carrito_arr = Object.values(grouped);
              this.actualizar_dventa_local();
              this.load_data = false;
            } else {
              iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: 'No se pudo cargar la orden.'
              });
              this.load_data = false;
            }
          },
          error => {
            console.log(error);
            this.load_data = false;
          }
        );
      },
      error => {
        console.log(error);
        this.load_data = false;
      }
    );
  }

  // Mapear carrito_arr local a dventa plano para el backend
  actualizar_dventa_local() {
    this.dventa = [];
    this.carrito_arr.forEach(element => {
      if (Array.isArray(element.variedad)) {
        element.variedad.forEach(varItem => {
          this.dventa.push({
            producto: element.producto._id,
            subtotal: element.producto.precio * varItem.cantidad,
            variedad: varItem.titulo,
            cantidad: varItem.cantidad,
            estado: varItem.estado || 'Solicitado',
            cliente: this._idCliente
          });
        });
      } else {
        this.dventa.push({
          producto: element.producto._id,
          subtotal: element.producto.precio * element.cantidad,
          variedad: element.variedad,
          cantidad: element.cantidad,
          estado: element.estado || 'Solicitado',
          cliente: this._idCliente
        });
      }
    });
  }

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

  seleccionar_cliente(item: any) {
    this.cliente_seleccionado = item;
    this._idCliente = item._id;
    this.filtroCliente = '';
    this.clientes = [];
    this.obtener_direcciones_cliente();
    this.actualizar_dventa_local();
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
              message: 'Se registró correctamente el cliente.'
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

  // Operaciones en memoria para el carrito de edición
  agregar_producto(producto, id) {
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

      // Comprobar si ya existe en el carrito local
      let existingIndex = this.carrito_arr.findIndex(item => item.producto._id === producto._id);
      if (existingIndex !== -1) {
        selectedVarieties.forEach(newVar => {
          let existingVar = this.carrito_arr[existingIndex].variedad.find(v => v.titulo === newVar.titulo);
          if (existingVar) {
            existingVar.cantidad += newVar.cantidad;
          } else {
            this.carrito_arr[existingIndex].variedad.push({
              titulo: newVar.titulo,
              cantidad: newVar.cantidad,
              estado: newVar.estado || 'Solicitado'
            });
          }
        });
        this.carrito_arr[existingIndex].total += total_item_amount;
      } else {
        let varietiesForCart = selectedVarieties.map(v => ({
          titulo: v.titulo,
          cantidad: v.cantidad,
          estado: v.estado || 'Solicitado'
        }));
        this.carrito_arr.push({
          _id: Math.random().toString(36).substr(2, 9),
          producto: producto,
          variedad: varietiesForCart,
          total: total_item_amount
        });
      }

      iziToast.show({
        title: 'SUCCESS',
        titleColor: '#1DC74C',
        color: '#FFF',
        class: 'text-success',
        position: 'topRight',
        message: 'Se agregó el producto al carrito temporal.'
      });

      this.carrito_data = { variedad: '' };
      this.producto.total = 0;
      this.producto.observacion = '';

      $('#select-' + id).modal('hide');
      $('.modal-backdrop').removeClass('show');
      
      this.actualizar_dventa_local();
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
  }

  eliminar_item(id) {
    this.carrito_arr = this.carrito_arr.filter(item => item._id !== id);
    this.actualizar_dventa_local();
    iziToast.show({
      title: 'SUCCESS',
      titleColor: '#1DC74C',
      color: '#FFF',
      class: 'text-success',
      position: 'topRight',
      message: 'Se eliminó el producto del carrito.'
    });
  }

  agregar_producto_sin_stock() {
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
                cantidad: v.cantidad,
                estado: 'Solicitado'
              }));

              this.carrito_arr.push({
                _id: Math.random().toString(36).substr(2, 9),
                producto: createdProduct,
                variedad: varietiesForCart,
                total: this.producto.total
              });

              iziToast.show({
                title: 'SUCCESS',
                titleColor: '#1DC74C',
                color: '#FFF',
                class: 'text-success',
                position: 'topRight',
                message: 'El producto sin stock se creó y se agregó al carrito.'
              });

              this.load_btn = false;
              $('#select-stock').modal('hide');
              $('.modal-backdrop').removeClass('show');

              this.producto = { categoria: '' };
              this.imgSelect = 'assets/img/01.jpg';
              this.file = undefined;

              this.init_Data();
              this.actualizar_dventa_local();
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
  }

  filtrarProducto() {
    if (this.filtro) {
      this._productoService.listar_productos_admin(this.filtro, this.token).subscribe(
        response => {
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

  guardar_cambios() {
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
      direccion: this.direccion_seleccionada._id,
      nota: this.producto.observacion || 'Manual admin order (edited)',
      envio_titulo: this.envio_titulo,
      envio_precio: Number(this.envio_precio),
      transaccion: this.transaccion,
      detalles: this.dventa
    };

    this.load_btn = true;
    this._adminService.actualizar_pedido_admin(this.id, ventaData, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se actualizó correctamente el pedido.'
        });

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
          message: 'Error al guardar cambios del pedido.'
        });
        this.load_btn = false;
        console.log(error);
      }
    );
  }

  abrir_modal_estado(estado: string) {
    this.eval_estado_data.estado = estado;
    this.eval_estado_data.motivo = '';
    this.eval_estado_data.notas_internas = this.venta.notas_internas || '';
    $('#modalEstado').modal('show');
  }

  actualizar_estado_logistica() {
    if (!this.eval_estado_data.motivo) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar un motivo para el cambio de estado.'
      });
      return;
    }

    this.load_btn_estado = true;
    this._adminService.actualizar_estado_venta_admin(this.id, this.eval_estado_data, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se actualizó el estado del pedido.'
        });
        this.load_btn_estado = false;
        $('#modalEstado').modal('hide');
        this.init_Data(); // Recargar datos
      },
      error => {
        console.error(error);
        this.load_btn_estado = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al cambiar el estado del pedido.'
        });
      }
    );
  }

  actualizar_estado_prenda(dventaId: string, nuevo_estado: string) {
    this._adminService.actualizar_estado_detalle_venta_admin(dventaId, { estado: nuevo_estado }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Prenda actualizada con éxito.'
        });
        this.init_Data();
      },
      error => {
        console.error(error);
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al actualizar prenda.'
        });
      }
    );
  }

  subir_evidencia_archivo(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this._adminService.subir_evidencia_pedido_admin(this.id, file, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Evidencia subida correctamente.'
          });
          this.init_Data();
        },
        error => {
          console.error(error);
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Error al subir la evidencia.'
          });
        }
      );
    }
  }

  listar_proveedores() {
    this._proveedorService.listar_proveedores_admin(this.token).subscribe(
      response => {
        this.proveedores = response.data || [];
      }
    );
  }

  actualizar_abastecimiento_item(varItem) {
    const data = {
      proveedor: varItem.proveedor || null,
      costo_compra: varItem.costo_compra || 0,
      fecha_estimada_acopio: varItem.fecha_estimada_acopio || null,
      estado: varItem.estado
    };
    
    this._adminService.actualizar_abastecimiento_prenda_admin(varItem._id, data, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Información de abastecimiento de la prenda guardada.'
        });
        this.init_Data();
      },
      error => {
        console.error(error);
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al guardar el abastecimiento de la prenda.'
        });
      }
    );
  }

  calcular_costo_produccion() {
    let total_costo = 0;
    this.carrito_arr.forEach(element => {
      if (element.variedad && Array.isArray(element.variedad)) {
        element.variedad.forEach(v => {
          total_costo += (v.costo_compra || 0) * v.cantidad;
        });
      }
    });
    return total_costo;
  }

  actualizar_empaque_pedido() {
    this.load_btn_empaque = true;
    this._adminService.actualizar_empaque_despacho_admin(this.id, this.empaque_data, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Datos de empaque y logística de FedEx actualizados.'
        });
        this.load_btn_empaque = false;
        this.init_Data();
      },
      error => {
        console.error(error);
        this.load_btn_empaque = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al actualizar datos de empaque.'
        });
      }
    );
  }

  registrar_escala() {
    if (!this.escala_data.estado || !this.escala_data.ubicacion) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar el estado y la ubicación de la escala.'
      });
      return;
    }

    this.load_btn_escala = true;
    this._adminService.registrar_escala_transito_admin(this.id, {
      estado: this.escala_data.estado,
      ubicacion: this.escala_data.ubicacion,
      descripcion: this.escala_data.descripcion,
      alerta_novedad_envio: this.venta.alerta_novedad_envio
    }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Escala de tránsito registrada.'
        });
        this.escala_data = { estado: '', ubicacion: '', descripcion: '' };
        this.load_btn_escala = false;
        this.init_Data();
      },
      error => {
        console.error(error);
        this.load_btn_escala = false;
      }
    );
  }

  guardar_alerta_novedad() {
    this._adminService.registrar_escala_transito_admin(this.id, {
      alerta_novedad_envio: this.venta.alerta_novedad_envio
    }, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Alerta de novedad de envío actualizada.'
        });
        this.init_Data();
      },
      error => {
        console.error(error);
      }
    );
  }
}
