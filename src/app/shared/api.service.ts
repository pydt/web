import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class ApiService {
  baseUrl = process.env.API_URL;

  constructor (private http: Http) {}

  getLoginUrl() {
    return this.get(this.baseUrl + '/auth/steam', true).then(data => {
      return data.redirectURL;
    });
  }

  validateSteamCredentials(queryString: string) {
    return this.get(this.baseUrl + '/auth/steam/validate' + queryString, true).then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('steamProfile', JSON.stringify(data.steamProfile));
        return data;
      }

      throw data;
    });
  }

  getGame(id) {
    return this.get(this.baseUrl + '/game/' + id);
  }

  joinGame(id) {
    return this.post(this.baseUrl + '/game/' + id + '/join', {});
  }

  startGame(id) {
    return this.post(this.baseUrl + '/game/' + id + '/start', {});
  }

  getTurnUrl(gameId) {
    return this.get(this.baseUrl + '/game/' + gameId + '/turn').then(data => {
      return data.downloadUrl;
    });
  }

  startTurnSubmit(gameId) {
    return this.post(this.baseUrl + '/game/' + gameId + '/turn/startSubmit', {});
  }

  finishTurnSubmit(gameId) {
    return this.post(this.baseUrl + '/game/' + gameId + '/turn/finishSubmit', {});
  }

  getUserGames() {
    return this.get(this.baseUrl + '/user/games');
  }

  createGame(gameName: string) {
    return this.post(this.baseUrl + '/game/create', {'displayName': gameName});
  }

  getUser() {
    return this.get(this.baseUrl + '/user');
  }

  setNotificationEmailAddress(emailAddress: string) {
    return this.post(this.baseUrl + '/user/setNotificationEmail', {'emailAddress': emailAddress});
  }

  getSteamProfiles(steamIds: string[]) {
    return this.get(this.baseUrl + '/user/steamProfiles?steamIds=' + steamIds.join());
  }

  getSteamProfile() {
    return JSON.parse(localStorage.getItem('steamProfile'));
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private getAuthHeaders(disableAuth) {
    let headers = new Headers();

    if (!disableAuth) {
      if (!this.isLoggedIn()) {
        throw new Error('Not Logged In!');
      }

      headers.append('Authorization', this.getToken());
    }

    return { headers: headers };
  }

  private get(url, disableAuth?) {
    return this.http.get(url, this.getAuthHeaders(disableAuth))
      .map(res => {
        return res.json();
      }).toPromise();
  }

  private post(url, data) {
    return this.http.post(url, data, this.getAuthHeaders(false))
      .map(res => {
        return res.json();
      }).toPromise();
  }
}
