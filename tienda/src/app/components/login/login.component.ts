import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { NgIf, NgClass } from '@angular/common';
declare var iziToast;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [NavComponent, FormsModule, FooterComponent, NgIf, NgClass]
})
export class LoginComponent implements OnInit {

  public user : any = {};
  public usuario : any = {};
  public nuevoCliente : any = {};
  public token;
  public isLogin = true;
  public returnUrl: string = '/';


  constructor(
    private _clienteService: ClienteService,
    private _router : Router,
    private _route : ActivatedRoute
  ) { 
    this.token = localStorage.getItem('token');
    if(this.token){
      this._router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
  }

  login(loginForm){
    if(loginForm.valid){
      
      let data = {
        email: this.user.email,
        password: this.user.password
      }
      
      this._clienteService.login_cliente(data).subscribe(
        response=>{
          if(response.data == undefined){
            iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: response.message
            });
          }else{
            this.usuario = response.data;
            localStorage.setItem('token',response.token);
            localStorage.setItem('_id',response.data._id);

            this._router.navigateByUrl(this.returnUrl);

          }
         
        },
        error=>{
          console.log(error);
          
        }
      );
      
    }else{
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

  registro(registroForm){
    if(registroForm.valid){
      this._clienteService.registro_cliente(this.nuevoCliente).subscribe(
        response => {
          if(response.data == undefined){
            iziToast.show({
                title: 'ERROR',
                titleColor: '#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position: 'topRight',
                message: response.message
            });
          } else {
            iziToast.show({
                title: 'SUCCESS',
                titleColor: '#1DC74C',
                color: '#FFF',
                class: 'text-success',
                position: 'topRight',
                message: 'Se registró e inició sesión correctamente.'
            });
            localStorage.setItem('token', response.token);
            localStorage.setItem('_id', response.data._id);
            this.nuevoCliente = {};
            this._router.navigateByUrl(this.returnUrl);
          }
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
