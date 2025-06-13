import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface User {
  id:number;
  first_name:string;
  last_name:string;
  email:string;
  password:string;
  gender:string;
  country_code:number;
  date_of_birth:Date;
  role_id:number;
  userId:number;
  roleId:number;
  role_name:string;


}

export interface PaginatedUsers {
  items: User[]; // Now explicitly uses the exported User interface
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl =`https://social-media-backend-js76.onrender.com/api/users`
  private usersListUrl = 'https://social-media-backend-js76.onrender.com/api/users';
  constructor(private http:HttpClient) { }

  private getAuthHeaders():HttpHeaders{
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getUsers(
    page: number,
    pageSize: number,
    searchTerm: string = '',
  ): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<PaginatedUsers>(this.usersListUrl, {
      headers: this.getAuthHeaders(),
      params: params,
    });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}`, data, {
      headers: this.getAuthHeaders(),
    });
  }
}
