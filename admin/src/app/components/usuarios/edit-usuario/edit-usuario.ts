import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

declare var iziToast: any;

@Component({
    selector: 'app-edit-usuario',
    templateUrl: './edit-usuario.html',
    styleUrls: ['./edit-usuario.css'],
    imports: [SidebarComponent, FormsModule, NgIf, RouterLink]
})
export class EditUsuario implements OnInit {

  public usuario: any = {};
  public id: any;
  public token: any;
  public load_btn = false;
  public load_data = true;

  constructor(
    private _route: ActivatedRoute,
    private _adminService: AdminService,
    private _router: Router
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this._route.params.subscribe(
      params => {
        this.id = params['id'];
        this._adminService.obtener_usuario_interno(this.id, this.token).subscribe(
          response => {
            if (response.data == undefined) {
              this.usuario = undefined;
              this.load_data = false;
            } else {
              this.usuario = response.data;
              this.usuario.password = ''; // Limpiar contraseña para edición opcional
              this.load_data = false;
            }
          },
          error => {
            console.log(error);
            this.load_data = false;
          }
        );
      }
    );
  }

  actualizar(updateForm: any) {
    if (updateForm.valid) {
      this.load_btn = true;
      this._adminService.actualizar_usuario_interno(this.id, this.usuario, this.token).subscribe(
        response => {
          if (response.data) {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se actualizó correctamente el usuario.'
            });
            this.load_btn = false;
            this._router.navigate(['/panel/usuarios']);
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message || 'Error al actualizar.'
            });
            this.load_btn = false;
          }
        },
        error => {
          console.log(error);
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
        message: 'Los datos del formulario no son válidos.'
      });
    }
  }

}
