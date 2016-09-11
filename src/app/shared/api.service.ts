import { Injectable } from '@angular/core';

@Injectable()
export class ApiService {
  url = process.env.API_URL;
}
