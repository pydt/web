import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

@Injectable()
export class ApiService {
  baseUrl = process.env.API_URL;

  constructor (private http: Http) {}

  getLoginUrl() {
    return this.http.get(this.baseUrl + '/auth/steam')
      .map(res => {
        return res.json().redirectURL;
      });
  }

  validateSteamCredentials(queryString: string) {
    return this.http.get(this.baseUrl + '/auth/steam/validate' + queryString)
      .map(res => {
        const data = res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      });
  }

  getPrincipal() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
