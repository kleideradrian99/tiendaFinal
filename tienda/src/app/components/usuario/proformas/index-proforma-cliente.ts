import { Component, OnInit } from '@angular/core';
import { SiderbarComponent } from '../siderbar/siderbar.component';
import { NgFor, NgIf, DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProformaService } from 'src/app/services/proforma.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { Router, RouterLink } from '@angular/router';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';
import { PagoService } from 'src/app/services/pago.service';

declare var iziToast;

@Component({
  selector: 'app-index-proforma-cliente',
  templateUrl: './index-proforma-cliente.html',
  imports: [SiderbarComponent, NgFor, NgIf, DatePipe, CurrencyPipe, NgClass, FormsModule, NavComponent, FooterComponent, RouterLink]
})
export class IndexProformaCliente implements OnInit {
  public token;
  public idcliente;
  public url;
  public load_data = true;
  public proformas: Array<any> = [];
  public proforma_seleccionada: any = undefined;
  
  public direcciones: Array<any> = [];
  public direccion_seleccionada_id: string = '';
  
  public metodo_pago = 'Transferencia';
  public card_data: any = {};
  public transaccion_id = '';
  public btn_load = false;

  // Variables para registro de pago manual (Comprobante)
  public pago_data: any = {
    monto: 0,
    moneda: 'USD',
    trm: 1,
    cuenta_destino: '',
    observaciones: ''
  };
  public comprobante_file: File | null = null;
  public comprobante_name = '';

  constructor(
    private _proformaService: ProformaService,
    private _clienteService: ClienteService,
    private _pagoService: PagoService,
    private _router: Router
  ) {
    this.token = localStorage.getItem('token');
    this.idcliente = localStorage.getItem('_id');
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    this.init_data();
    this.obtener_direcciones();
  }

  init_data() {
    this.load_data = true;
    this._proformaService.listar_proformas_cliente(this.token).subscribe(
      response => {
        this.proformas = response.data || [];
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  obtener_direcciones() {
    this._clienteService.obtener_direccion_todos_cliente(this.idcliente, this.token).subscribe(
      response => {
        this.direcciones = response.data || [];
        const principal = this.direcciones.find(item => item.principal);
        if (principal) {
          this.direccion_seleccionada_id = principal._id;
        } else if (this.direcciones.length > 0) {
          this.direccion_seleccionada_id = this.direcciones[0]._id;
        }
      }
    );
  }

  ver_detalle(id) {
    this.proforma_seleccionada = undefined;
    this._proformaService.obtener_detalle_proforma_cliente(id, this.token).subscribe(
      response => {
        this.proforma_seleccionada = response.data;
      },
      error => {
        console.error(error);
      }
    );
  }

  cerrar_detalle() {
    this.proforma_seleccionada = undefined;
  }

  fileChangeEvent(event: any): void {
    var file: File;
    if (event.target.files && event.target.files[0]) {
      file = <File>event.target.files[0];
      
      // Validar tipo de archivo
      if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'application/pdf') {
        this.comprobante_file = file;
        this.comprobante_name = file.name;
      } else {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Solo se permiten imágenes (JPG, PNG) y archivos PDF.'
        });
        this.comprobante_file = null;
        this.comprobante_name = '';
      }
    }
  }

  pagar_proforma() {
    if (!this.direccion_seleccionada_id) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe seleccionar una dirección de envío.'
      });
      return;
    }

    if (this.metodo_pago === 'Transferencia') {
      this.registrar_pago_manual();
      return;
    }

    // Flujo automático con Tarjeta de Crédito (Simulado / Culqi)
    this.btn_load = true;
    let payload = {
      proformaId: this.proforma_seleccionada._id,
      direccionId: this.direccion_seleccionada_id,
      transaccion: 'PAGO TARJETA DIRECTO'
    };

    this._proformaService.procesar_proforma_venta(payload, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Tu compra ha sido procesada con éxito a partir de la proforma.'
        });
        this.btn_load = false;
        this.proforma_seleccionada = undefined;
        this._router.navigate(['/cuenta/ordenes']);
      },
      error => {
        console.error(error);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Error al procesar la compra.'
        });
      }
    );
  }

  registrar_pago_manual() {
    if (!this.pago_data.monto || this.pago_data.monto <= 0) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingrese un monto pagado válido.'
      });
      return;
    }

    if (!this.pago_data.cuenta_destino) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe seleccionar la cuenta bancaria de destino.'
      });
      return;
    }

    if (!this.comprobante_file) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe adjuntar el archivo del comprobante de pago.'
      });
      return;
    }

    this.btn_load = true;
    this.pago_data.proforma = this.proforma_seleccionada._id;

    this._pagoService.registrar_comprobante_cliente(this.pago_data, this.comprobante_file, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Comprobante registrado con éxito. Finanzas validará tu pago pronto.'
        });
        this.btn_load = false;
        this.proforma_seleccionada = undefined;
        this.init_data(); // Refrescar listado
      },
      error => {
        console.error(error);
        this.btn_load = false;
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: error.error.message || 'Error al subir el comprobante.'
        });
      }
    );
  }
}
