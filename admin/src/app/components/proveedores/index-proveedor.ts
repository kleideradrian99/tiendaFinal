import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgFor, NgIf, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProveedorService } from 'src/app/services/proveedor.service';
import { AdminService } from 'src/app/services/admin.service';

declare var iziToast;

@Component({
  selector: 'app-index-proveedor',
  templateUrl: './index-proveedor.html',
  styleUrls: ['./index-proveedor.css'],
  imports: [SidebarComponent, NgFor, NgIf, DatePipe, NgClass, FormsModule, RouterLink]
})
export class IndexProveedor implements OnInit {
  public token;
  public load_data = true;
  public proveedores: Array<any> = [];
  
  public nuevo_proveedor = {
    razon_social: '',
    contacto: '',
    telefono: '',
    email: ''
  };
  
  public proveedor_editando: any = null;
  public btn_load = false;

  constructor(
    private _proveedorService: ProveedorService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    if (this.token) {
      this.init_data();
    }
  }

  init_data() {
    this.load_data = true;
    this._proveedorService.listar_proveedores_admin(this.token).subscribe(
      response => {
        this.proveedores = response.data || [];
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  registrar_proveedor() {
    if (!this.nuevo_proveedor.razon_social) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar la Razón Social del proveedor.'
      });
      return;
    }

    this.btn_load = true;
    this._proveedorService.registro_proveedor_admin(this.nuevo_proveedor, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Proveedor registrado exitosamente.'
        });
        this.nuevo_proveedor = { razon_social: '', contacto: '', telefono: '', email: '' };
        this.btn_load = false;
        this.init_data();
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
          message: 'Error al registrar el proveedor.'
        });
      }
    );
  }

  seleccionar_editar(item) {
    this.proveedor_editando = { ...item };
  }

  cancelar_edicion() {
    this.proveedor_editando = null;
  }

  guardar_proveedor() {
    if (!this.proveedor_editando.razon_social) {
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position: 'topRight',
        message: 'Debe ingresar la Razón Social del proveedor.'
      });
      return;
    }

    this.btn_load = true;
    this._proveedorService.actualizar_proveedor_admin(this.proveedor_editando._id, this.proveedor_editando, this.token).subscribe(
      response => {
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Proveedor actualizado exitosamente.'
        });
        this.proveedor_editando = null;
        this.btn_load = false;
        this.init_data();
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
          message: 'Error al actualizar el proveedor.'
        });
      }
    );
  }

  eliminar_proveedor(id) {
    if (confirm('¿Está seguro de eliminar este proveedor/taller?')) {
      this._proveedorService.eliminar_proveedor_admin(id, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Proveedor eliminado.'
          });
          this.init_data();
        },
        error => {
          console.error(error);
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Error al eliminar el proveedor.'
          });
        }
      );
    }
  }
}
