import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'
import {
  CreateCommentBackendResponse,
  CreateCommentRequest,
  CreatePostBackendResponse,
  GetPostsBackendResponse,
  PostsItems,
  CreatePostRequest
} from '../app/interface/post.interface';

interface SimpleSuccessResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {

  private apiUrl = `http://localhost:5000/api/auth/v1/posts`;
  private commentUrl = `http://localhost:5000/api/comment`


  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  constructor(private http: HttpClient) {}

  getPosts():Observable<GetPostsBackendResponse>{
    return this.http.get<GetPostsBackendResponse>(`${this.apiUrl}`)
}

  createPost(postData: CreatePostRequest): Observable<CreatePostBackendResponse> {
    return this.http.post<CreatePostBackendResponse>(`http://localhost:5000/api/auth/v1/post`, postData,{
      headers: this.getAuthHeaders(),
    });


  }
  makeComment(postId: number, commentData: CreateCommentRequest): Observable<CreateCommentBackendResponse> {
    // Ensure the endpoint matches your backend route (e.g., /api/posts/:postId/comments)
    return this.http.post<CreateCommentBackendResponse>(`${this.commentUrl}/post/${postId}`, commentData,{
      headers: this.getAuthHeaders(),
    });
  }
  deleteComment(id:number):Observable<SimpleSuccessResponse>{
    return this.http.delete<SimpleSuccessResponse>(`${this.commentUrl}/delete/${id}`,{
      headers:this.getAuthHeaders(),
    })
  }

  deletePost(postId:number):Observable<SimpleSuccessResponse>{
    return this.http.delete<SimpleSuccessResponse>(`http://localhost:5000/api/auth/v1/posts/${postId}`,{
      headers:this.getAuthHeaders(),
    })
  }
  updatePost(postId:number, postData: CreatePostRequest ):Observable<SimpleSuccessResponse>{
    return this.http.put<SimpleSuccessResponse>(`http://localhost:5000/api/auth/v1/posts/${postId}`,postData,{
      headers:this.getAuthHeaders(),
    })

  }

  updateComment(postId:number, commentData: CreateCommentRequest):Observable<SimpleSuccessResponse>{
    return this.http.put<SimpleSuccessResponse>(`http://localhost:5000/api/comment/comments/${postId}`,commentData,{
      headers:this.getAuthHeaders(),
    })

  }

}
