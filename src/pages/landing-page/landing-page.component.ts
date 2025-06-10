// src/pages/landing-page/landing-page.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service.service';
import { PostServiceService } from '../../services/post-service.service';
import {
  PostsItems,
  GetPostsBackendResponse,
  CreateCommentRequest,
  CreateCommentBackendResponse, CommentItem
} from '../../app/interface/post.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {PostCreationModalComponent} from '../post-creation-modal/post-creation-modal.component';
import {User} from  '../../services/auth-service.service'




@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PostCreationModalComponent],
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  posts: PostsItems[] = [];
  isMenuOpen: boolean = false;
  isAuthenticated = false;
  currentUserId: string | null = null;
  showPostCreationModal: boolean = false;
  currentUser:User | null = null;

  commentForms: { [postId: number]: FormGroup } = {};
  commentErrorMessages: { [postId: number]: string | null } = {};
  commentSuccessMessages: { [postId: number]: string | null } = {};

  // NEW: State for editing posts
  editingPostId: number | null = null;
  postEditForm: FormGroup; // Single form for editing posts

  // NEW: State for editing comments
  editingCommentId: number | null = null;
  commentEditForm: FormGroup; // Single form for editing comments


  constructor(
    private AuthService: AuthServiceService,
    private router: Router,
    private PostService: PostServiceService,
    private fb: FormBuilder
  ) {
    // Initialize post edit form
    this.postEditForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
    // Initialize comment edit form
    this.commentEditForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.AuthService.isAuthenticated();
    if (this.isAuthenticated) {
      this.currentUserId = this.AuthService.getUserId();
      this.currentUser = this.AuthService.getUser();
    }
    this.loadPosts();
  }

  loadPosts(): void {
    this.PostService.getPosts().subscribe({
      next: (response: GetPostsBackendResponse) => {
        this.posts = response.posts;
        this.posts.forEach(post => {
          if (!this.commentForms[post.id]) {
            this.commentForms[post.id] = this.fb.group({
              content: ['', [Validators.required, Validators.minLength(2)]]
            });
          }
        });
      },
      error: err => {
        console.error('Error fetching posts:', err);
      }
    });
  }

  isPostAuthor(authorId: string): boolean {
    return this.isAuthenticated && this.currentUserId === authorId;
  }

  isCommentAuthor(commenterId: string): boolean {
    return this.isAuthenticated && this.currentUserId === commenterId;
  }

  // NEW: Start editing a post
  startEditPost(post: PostsItems): void {
    this.editingPostId = post.id;
    this.postEditForm.patchValue({
      title: post.title,
      content: post.content
    });
  }

  // NEW: Save edited post
  saveEditedPost(): void {
    if (!this.editingPostId || this.postEditForm.invalid) {
      return;
    }
    this.PostService.updatePost(this.editingPostId, this.postEditForm.value).subscribe({
      next: (response) => {
        console.log('Post updated successfully:', response.message);
        this.editingPostId = null; // Exit edit mode
        this.loadPosts(); // Reload posts to show updated content
      },
      error: (error) => {
        console.error('Error updating post:', error);
        alert(error.error?.message || 'Failed to update post.');
      }
    });
  }

  // NEW: Cancel post editing
  cancelEditPost(): void {
    this.editingPostId = null;
    this.postEditForm.reset();
  }

  // NEW: Start editing a comment
  startEditComment(comment: CommentItem): void {
    this.editingCommentId = comment.id;
    this.commentEditForm.patchValue({
      content: comment.content
    });
  }

  // NEW: Save edited comment
  saveEditedComment(): void {
    if (!this.editingCommentId || this.commentEditForm.invalid) {
      return;
    }
    this.PostService.updateComment(this.editingCommentId, this.commentEditForm.value).subscribe({
      next: (response) => {
        console.log('Comment updated successfully:', response.message);
        this.editingCommentId = null; // Exit edit mode
        this.loadPosts(); // Reload posts to show updated content
      },
      error: (error) => {
        console.error('Error updating comment:', error);
        alert(error.error?.message || 'Failed to update comment.');
      }
    });
  }

  // NEW: Cancel comment editing
  cancelEditComment(): void {
    this.editingCommentId = null;
    this.commentEditForm.reset();
  }

  onDeletePost(postId: number): void {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    this.PostService.deletePost(postId).subscribe({
      next: (response) => {
        console.log('Post deleted successfully:', response.message);
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        alert(error.error?.message || 'Failed to delete post.');
      }
    });
  }

  onDeleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.PostService.deleteComment(commentId).subscribe({
      next: (response) => {
        console.log('Comment deleted successfully:', response.message);
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
        alert(error.error?.message || 'Failed to delete comment.');
      }
    });
  }

  openPostCreationModal(): void {
    if (this.isAuthenticated) {
      this.showPostCreationModal = true;
    } else {
      alert('Please log in to create a post.');
      this.router.navigate(['/login']);
    }
  }

  onModalClose(): void {
    this.showPostCreationModal = false;
  }

  onPostSuccessfullyCreated(): void {
    this.loadPosts();
    this.onModalClose();
  }

  onSubmitComment(postId: number): void {
    const commentForm = this.commentForms[postId];
    this.commentErrorMessages[postId] = null;
    this.commentSuccessMessages[postId] = null;

    if (!commentForm) {
      console.error('Comment form not found for post ID:', postId);
      return;
    }

    if (!this.isAuthenticated) {
      this.commentErrorMessages[postId] = 'You must be logged in to comment.';
      return;
    }

    if (commentForm.invalid) {
      this.commentErrorMessages[postId] = 'Comment cannot be empty and must be at least 2 characters.';
      commentForm.markAllAsTouched();
      return;
    }

    const commentData: CreateCommentRequest = commentForm.value;

    this.PostService.makeComment(postId, commentData).subscribe({
      next: (response: CreateCommentBackendResponse) => {
        this.commentSuccessMessages[postId] = response.message;
        commentForm.reset();
        commentForm.markAsUntouched();
        commentForm.markAsPristine();
        this.loadPosts();
        setTimeout(() => this.commentSuccessMessages[postId] = null, 3000);
      },
      error: (error) => {
        this.commentErrorMessages[postId] = error.error?.message || 'Failed to post comment. Please try again.';
        console.error('Error posting comment:', error);
        setTimeout(() => this.commentErrorMessages[postId] = null, 5000);
      }
    });
  }

  getCommentForm(postId: number): FormGroup {
    return this.commentForms[postId];
  }

  hasCommentError(postId: number, controlName: string, errorType: string): boolean | undefined {
    const form = this.commentForms[postId];
    if (!form) return false;
    const control = form.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }

  // NEW: Helper for post edit form validation
  hasPostEditError(controlName: string, errorType: string): boolean | undefined {
    const control = this.postEditForm.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }

  // NEW: Helper for comment edit form validation
  hasCommentEditError(controlName: string, errorType: string): boolean | undefined {
    const control = this.commentEditForm.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }


  isAdmin():boolean{
    return this.isAuthenticated && this.currentUser?.role_id === 1;
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.AuthService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['']);
  }
}
