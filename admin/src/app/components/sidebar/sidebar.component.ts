import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    imports: [RouterLink, RouterLinkActive, NgIf]
})
export class SidebarComponent implements OnInit {

  public menuOpen = false;
  public user: any = {};

  constructor(private _router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded) {
        this.user = {
          nombres: decoded.nombres,
          apellidos: decoded.apellidos,
          email: decoded.email,
          role: decoded.role || 'Administrador'
        };
      }
    }
  }

  decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(payload));
    } catch (e) {
      return null;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.classList.add('cs-offcanvas-open');
    } else {
      document.body.classList.remove('cs-offcanvas-open');
    }
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('cs-offcanvas-open');
  }

  logout() {
    localStorage.clear();
    this.closeMenu();
    this._router.navigate(['/login']);
  }

}
