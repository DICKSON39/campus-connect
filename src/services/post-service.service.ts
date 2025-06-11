import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'
import {
  CreateCommentBackendResponse,
  CreateCommentRequest,
  CreatePostBackendResponse,
  GetPostsBackendResponse,
  PostsItems,
  CreatePostRequest, GetSinglePostBackendResponse
} from '../app/interface/post.interface';

interface SimpleSuccessResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostServiceService {

  private apiUrl = `https://social-media-backend-js76.onrender.com/api/auth/v1/posts`;
  private commentUrl = `https://social-media-backend-js76.onrender.com/api/comment`


  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  constructor(private http: HttpClient) {}

  getPosts():Observable<GetPostsBackendResponse>{
    return this.http.get<GetPostsBackendResponse>(`${this.apiUrl}`)
}

  getMyPost():Observable<GetPostsBackendResponse>{
    return this.http.get<GetPostsBackendResponse>(`${this.apiUrl}/my-posts,{
    headers: this.getAuthHeaders()
    }`)

  }
  getPostById(postId: number): Observable<GetSinglePostBackendResponse> {
    return this.http.get<GetSinglePostBackendResponse>(`${this.apiUrl}/${postId}`, {
      headers: this.getAuthHeaders(), // Assuming this endpoint requires authentication
    });
  }


  createPost(postData: FormData): Observable<CreatePostBackendResponse> {
    return this.http.post<CreatePostBackendResponse>(`https://social-media-backend-js76.onrender.com/api/auth/v1/post`, postData,{
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
    return this.http.delete<SimpleSuccessResponse>(`https://social-media-backend-js76.onrender.com/api/auth/v1/posts/${postId}`,{
      headers:this.getAuthHeaders(),
    })
  }
  updatePost(postId:number, postData: FormData ):Observable<SimpleSuccessResponse>{
    return this.http.put<SimpleSuccessResponse>(`https://social-media-backend-js76.onrender.com/api/auth/v1/posts/${postId}`,postData,{
      headers:this.getAuthHeaders(),
    })

  }

  updateComment(postId:number, commentData: CreateCommentRequest):Observable<SimpleSuccessResponse>{
    return this.http.put<SimpleSuccessResponse>(`https://social-media-backend-js76.onrender.com/api/comment/comments/${postId}`,commentData,{
      headers:this.getAuthHeaders(),
    })

  }


}
