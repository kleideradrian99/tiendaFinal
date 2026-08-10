import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { FedexService } from 'src/app/services/fedex.service';
import { AdminService } from 'src/app/services/admin.service';

declare var iziToast;

@Component({
  selector: 'app-index-fedex',
  templateUrl: './index-fedex.html',
  imports: [SidebarComponent, FormsModule, NgFor, NgIf, CurrencyPipe]
})
export class IndexFedex implements OnInit {
  public token;
  public load_data = true;
  public load_btn = false;
  public fedex_arr: Array<any> = [];
  public nuevo_tarifario: any = {
    peso: undefined,
    A: undefined,
    B: undefined,
    C: undefined,
    D: undefined,
    E: undefined,
    F: undefined,
    G: undefined,
    H: undefined,
    I: undefined
  };

  constructor(
    private _fedexService: FedexService,
    private _adminService: AdminService
  ) {
    this.token = this._adminService.getToken();
  }

  ngOnInit(): void {
    this.init_data();
  }

  init_data() {
    this.load_data = true;
    this._fedexService.listar_tarifarios_admin(this.token).subscribe(
      response => {
        this.fedex_arr = response.data || [];
        this.load_data = false;
      },
      error => {
        console.error(error);
        this.load_data = false;
      }
    );
  }

  registro(registroForm) {
    if (registroForm.valid) {
      this.load_btn = true;
      this._fedexService.registro_tarifario_admin(this.nuevo_tarifario, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Rango de tarifa registrado correctamente.'
          });
          this.load_btn = false;
          this.nuevo_tarifario = {
            peso: undefined,
            A: undefined,
            B: undefined,
            C: undefined,
            D: undefined,
            E: undefined,
            F: undefined,
            G: undefined,
            H: undefined,
            I: undefined
          };
          this.init_data();
        },
        error => {
          console.error(error);
          this.load_btn = false;
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FF0000',
            color: '#FFF',
            class: 'text-danger',
            position: 'topRight',
            message: 'Error al registrar la tarifa.'
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
        message: 'Formulario no válido.'
      });
    }
  }

  eliminar(id) {
    if (confirm('¿Está seguro de eliminar esta tarifa?')) {
      this._fedexService.eliminar_tarifario_admin(id, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Tarifa eliminada correctamente.'
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
            message: 'No se pudo eliminar la tarifa.'
          });
        }
      );
    }
  }
}
