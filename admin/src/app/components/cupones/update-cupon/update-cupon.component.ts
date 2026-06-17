import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CuponService } from 'src/app/services/cupon.service';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var iziToast;

@Component({
    selector: 'app-update-cupon',
    templateUrl: './update-cupon.component.html',
    styleUrls: ['./update-cupon.component.css'],
    imports: [SidebarComponent, NgIf, FormsModule, RouterLink]
})
export class UpdateCuponComponent implements OnInit {

  public token;

  public cupon: any = {
    tipo: ''
  };
  public load_btn = false;
  public id;
  public load_data = true;

  constructor(
    private _cuponService: CuponService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this._route.params.subscribe(
      params => {
        this.id = params['id'];

        this._cuponService.obtener_cupon_admin(this.id, this.token).subscribe(
          response => {
            if (response.data == undefined) {
              this.cupon = undefined;
              this.load_data = false;
            } else {
              this.cupon = response.data;
              this.load_data = false;
            }
          }
        )
      }
    )
  }

  actualizar(actualizarForm) {
    if (actualizarForm.valid) {
      this.load_btn = true;
      this._cuponService.actualizar_cupon_admin(this.id, this.cupon, this.token).subscribe(
        response => {

          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position: 'topRight',
            message: 'Se actualizó correctamente el cupón.'
          });

          this.load_btn = false;

          this._router.navigate(['/panel/cupones']);

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
