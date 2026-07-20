import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, SlicePipe, NgClass, UpperCasePipe } from '@angular/common';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';

declare var iziToast: any;
declare var $: any;

@Component({
    selector: 'app-index-usuario',
    templateUrl: './index-usuario.html',
    styleUrls: ['./index-usuario.css'],
    imports: [SidebarComponent, RouterLink, FormsModule, NgIf, NgFor, NgbPagination, SlicePipe, NgClass, UpperCasePipe]
})
export class IndexUsuario implements OnInit {

  public usuarios: Array<any> = [];
  public filtro_valor = '';
  public page = 1;
  public pageSize = 20;
  public token: any;
  public load_data = true;

  constructor(
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.init_Data();
  }

  init_Data() {
    this.load_data = true;
    this._adminService.listar_usuarios_internos('null', this.token).subscribe(
      response => {
        this.usuarios = response.data;
        this.load_data = false;
      },
      error => {
        console.log(error);
        this.load_data = false;
      }
    );
  }

  filtro() {
    if (this.filtro_valor) {
      this.load_data = true;
      this._adminService.listar_usuarios_internos(this.filtro_valor, this.token).subscribe(
        response => {
          this.usuarios = response.data;
          this.load_data = false;
        },
        error => {
          console.log(error);
          this.load_data = false;
        }
      );
    } else {
      this.init_Data();
    }
  }

  eliminar(id: any) {
    this._adminService.eliminar_usuario_interno(id, this.token).subscribe(
      response => {
        iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se desactivó correctamente el usuario.'
        });

        $('#delete-' + id).modal('hide');
        $('.modal-backdrop').removeClass('show');
        this.init_Data();
      },
      error => {
        console.log(error);
      }
    );
  }
}
