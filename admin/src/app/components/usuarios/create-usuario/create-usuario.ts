import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

declare var iziToast: any;

@Component({
    selector: 'app-create-usuario',
    templateUrl: './create-usuario.html',
    styleUrls: ['./create-usuario.css'],
    imports: [SidebarComponent, FormsModule, NgIf, RouterLink]
})
export class CreateUsuario implements OnInit {

  public usuario: any = {
    rol: ''
  };
  public token: any;
  public load_btn = false;

  constructor(
    private _adminService: AdminService,
    private _router: Router
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
  }

  registro(registroForm: any) {
    if (registroForm.valid) {
      this.load_btn = true;
      this._adminService.registrar_usuario_interno(this.usuario, this.token).subscribe(
        response => {
          if (response.data) {
            iziToast.show({
              title: 'SUCCESS',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se registró correctamente el nuevo usuario interno.'
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
              message: response.message || 'Error al registrar.'
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
