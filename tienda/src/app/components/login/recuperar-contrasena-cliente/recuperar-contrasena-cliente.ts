import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { NavComponent } from '../../nav/nav.component';
import { FooterComponent } from '../../footer/footer.component';

declare var iziToast: any;

@Component({
    selector: 'app-recuperar-contrasena-cliente',
    templateUrl: './recuperar-contrasena-cliente.html',
    styleUrls: ['./recuperar-contrasena-cliente.css'],
    imports: [FormsModule, NgIf, RouterLink, NavComponent, FooterComponent]
})
export class RecuperarContrasenaCliente implements OnInit {

  public email = '';
  public password = '';
  public confirmPassword = '';
  public token: any = null;
  public hasToken = false;
  public load_btn = false;

  constructor(
    private _route: ActivatedRoute,
    private _clienteService: ClienteService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(
      params => {
        this.token = params['token'];
        if (this.token) {
          this.hasToken = true;
        }
      }
    );
  }

  enviarEnlace(form: any) {
    if (form.valid) {
      this.load_btn = true;
      this._clienteService.enviar_recuperacion_cliente({ email: this.email }).subscribe(
        response => {
          if (response.data) {
            iziToast.show({
              title: 'ÉXITO',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Se envió un correo electrónico con el enlace de recuperación.'
            });
            this.email = '';
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message || 'Error al enviar el correo.'
            });
          }
          this.load_btn = false;
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
        message: 'Por favor ingrese un correo válido.'
      });
    }
  }

  restablecerClave(form: any) {
    if (form.valid) {
      if (this.password !== this.confirmPassword) {
        iziToast.show({
          title: 'ERROR',
          titleColor: '#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position: 'topRight',
          message: 'Las contraseñas no coinciden.'
        });
        return;
      }

      this.load_btn = true;
      this._clienteService.restablecer_contrasena_cliente({ token: this.token, password: this.password }).subscribe(
        response => {
          if (response.data) {
            iziToast.show({
              title: 'ÉXITO',
              titleColor: '#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position: 'topRight',
              message: 'Tu contraseña ha sido restablecida correctamente.'
            });
            this.load_btn = false;
            this._router.navigate(['/login']);
          } else {
            iziToast.show({
              title: 'ERROR',
              titleColor: '#FF0000',
              color: '#FFF',
              class: 'text-danger',
              position: 'topRight',
              message: response.message || 'Token inválido o expirado.'
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
        message: 'Por favor rellene todos los campos.'
      });
    }
  }

}
