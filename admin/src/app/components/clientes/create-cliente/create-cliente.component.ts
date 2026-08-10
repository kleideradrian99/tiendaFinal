import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
declare var iziToast;

@Component({
    selector: 'app-create-cliente',
    templateUrl: './create-cliente.component.html',
    styleUrls: ['./create-cliente.component.css'],
    imports: [SidebarComponent, FormsModule, NgIf, NgFor, RouterLink]
})
export class CreateClienteComponent implements OnInit {

  public cliente: any = {
    genero: ''
  };
  public token;
  public load_btn = false;
  public asesores: Array<any> = [];
  public current_user_role: string | null = '';

  constructor(
    private _clienteService: ClienteService,
    private _adminService: AdminService,
    private _router: Router
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.current_user_role = this._adminService.getRole();
    if (['admin', 'direccion'].includes(this.current_user_role)) {
      this._adminService.listar_usuarios_internos('null', this.token).subscribe(
        response => {
          this.asesores = response.data.filter((u: any) => ['asesora', 'soporte'].includes(u.rol));
        }
      );
    }
  }

  registro(registroForm) {
    if (registroForm.valid) {
      this.load_btn = true;
      this._clienteService.registro_cliente_admin(this.cliente, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se registro correctamente el nuevo cliente.'
          });

          this.cliente = {
            genero: '',
            nombres: '',
            apellidos: '',
            f_nacimiento: '',
            telefono: '',
            dni: '',
            email: ''
          }

          this.load_btn = false;

          this._router.navigate(['/panel/clientes']);
        },
        error => {
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
        message: 'Los datos del formulario no son validos'
      });
    }
  }

}
