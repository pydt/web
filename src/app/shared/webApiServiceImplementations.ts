import { Injectable } from '@angular/core';
import { ApiUrlProvider, ApiCredentialsProvider, SteamProfile } from 'pydt-shared';

@Injectable()
export class WebApiCredentialsProvider implements ApiCredentialsProvider {
  store(token: string, profile: SteamProfile): Promise<void> {
    localStorage.setItem('token', token);
    localStorage.setItem('steamProfile', JSON.stringify(profile));

    return Promise.resolve();
  }

  getToken(): Promise<string> {
    return Promise.resolve((localStorage.getItem('token') || '').trim());
  }

  getSteamProfile(): Promise<SteamProfile> {
    return Promise.resolve(JSON.parse((localStorage.getItem('steamProfile') || '{}').trim()));
  }
}

@Injectable()
export class WebApiUrlProvider implements ApiUrlProvider {
  url: string = process.env.API_URL;
}
