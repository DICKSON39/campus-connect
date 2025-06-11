import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthServiceService, User } from '../../services/auth-service.service';
import { PostServiceService } from '../../services/post-service.service';
import {
  PostsItems,
  GetPostsBackendResponse,
  CreateCommentRequest,
  CreateCommentBackendResponse,
  CommentItem
} from '../../app/interface/post.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostCreationModalComponent } from '../post-creation-modal/post-creation-modal.component';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators'; // Keep this import for the loader

// Extend PostsItems to include the safeContent property
interface PostsItemsWithSafeContent extends PostsItems {
  safeContent?: SafeHtml; // Optional, as it's generated on the fly
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PostCreationModalComponent,
    MarkdownModule
  ],
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  posts: PostsItemsWithSafeContent[] = []; // Use the extended interface
  isMenuOpen = false;
  isAuthenticated = false;
  isSavingPost = false; // Flag to control the loading spinner for post edits

  currentUserId: string | null = null;
  showPostCreationModal = false;
  currentUser: User | null = null;

  commentForms: { [postId: number]: FormGroup } = {};
  commentErrorMessages: { [postId: number]: string | null } = {};
  commentSuccessMessages: { [postId: number]: string | null } = {};

  editingPostId: number | null = null;
  postEditForm: FormGroup;

  editingCommentId: number | null = null;
  commentEditForm: FormGroup;

  constructor(
    private AuthService: AuthServiceService,
    private router: Router,
    private PostService: PostServiceService,
    private fb: FormBuilder,
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer
  ) {
    this.postEditForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      image: [null] // Field for image file
    });

    this.commentEditForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.AuthService.isAuthenticated();

    if (this.isAuthenticated) {
      this.AuthService.getUserId().subscribe({
        next: (userId: string | null) => {
          this.currentUserId = userId;
        },
        error: (err) => {
          console.error('Error loading user ID:', err);
          this.AuthService.logout();
          this.router.navigate(['/login']);
        }
      });

      this.AuthService.getUser().subscribe({
        next: (user: User | null) => {
          this.currentUser = user;
          console.log('Current user loaded:', this.currentUser);
        },
        error: (err) => {
          console.error('Error loading current user:', err);
          this.AuthService.logout();
          this.router.navigate(['/login']);
        }
      });
    }

    this.loadPosts();
  }

  loadPosts(): void {
    this.PostService.getPosts().subscribe({
      next: (response: GetPostsBackendResponse) => {
        this.posts = response.posts.map(post => {
          const renderedHtml = this.markdownService.parse(post.content);
          return {
            ...post,
            safeContent: this.sanitizer.bypassSecurityTrustHtml(<string>renderedHtml)
          };
        });

        this.posts.forEach(post => {
          if (!this.commentForms[post.id]) {
            this.commentForms[post.id] = this.fb.group({
              content: ['', [Validators.required, Validators.minLength(2)]]
            });
          }
        });
      },
      error: err => console.error('Error fetching posts:', err)
    });
  }

  // Helper function for template debugging (can be removed after fix)
  getType(value: any): string {
    return typeof value;
  }

  // Optional: Add a trackBy function for *ngFor performance
  trackByPostId(index: number, post: PostsItems): number {
    return post.id;
  }

  trackByCommentId(index: number, comment: CommentItem): number {
    return comment.id;
  }

  isPostAuthor(authorId: string): boolean {
    return this.isAuthenticated && this.currentUserId === authorId;
  }

  isCommentAuthor(commenterId: string): boolean {
    return this.isAuthenticated && this.currentUserId === commenterId;
  }

  startEditPost(post: PostsItems): void {
    this.editingPostId = post.id;
    this.postEditForm.patchValue({
      title: post.title,
      content: post.content,
      image: null // Clear image field; file inputs can't be patched with existing data
    });
  }

  saveEditedPost(): void {
    if (!this.editingPostId || this.postEditForm.invalid) return;

    this.isSavingPost = true; // Set loading to true when saving starts

    const formValue = this.postEditForm.value;
    const formData = new FormData(); // Correctly create FormData instance
    formData.append('title', formValue.title);
    formData.append('content', formValue.content);
    if (formValue.image) {
      formData.append('image', formValue.image);
    }

    // Pass the 'formData' instance here, not the 'FormData' class
    this.PostService.updatePost(this.editingPostId, formData)
      .pipe(
        finalize(() => {
          this.isSavingPost = false; // Set loading to false when observable completes
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Post updated with image:', res.message);
          this.editingPostId = null;
          this.loadPosts();
        },
        error: (error) => {
          console.error('Error updating post:', error);
          // IMPORTANT: Replace alert with a custom modal UI in a real app
          alert(error.error?.message || 'Failed to update post.');
        }
      });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.postEditForm.patchValue({ image: file });
      this.postEditForm.get('image')?.markAsDirty();
    }
  }

  cancelEditPost(): void {
    this.editingPostId = null;
    this.postEditForm.reset();
  }

  startEditComment(comment: CommentItem): void {
    this.editingCommentId = comment.id;
    this.commentEditForm.patchValue({ content: comment.content });
  }

  saveEditedComment(): void {
    if (!this.editingCommentId || this.commentEditForm.invalid) return;

    this.PostService.updateComment(this.editingCommentId, this.commentEditForm.value).subscribe({
      next: (res) => {
        console.log('Comment updated successfully:', res.message);
        this.editingCommentId = null;
        this.loadPosts();
      },
      error: (error) => {
        console.error('Error updating comment:', error);
        // IMPORTANT: Replace alert with a custom modal UI in a real app
        alert(error.error?.message || 'Failed to update comment.');
      }
    });
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.commentEditForm.reset();
  }

  onDeletePost(postId: number): void {
    // IMPORTANT: Replace confirm with a custom modal UI in a real app
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.PostService.deletePost(postId).subscribe({
      next: (res) => {
        console.log('Post deleted:', res.message);
        this.loadPosts();
      },
      error: (err) => {
        console.error('Delete post error:', err);
        // IMPORTANT: Replace alert with a custom modal UI in a real app
        alert(err.error?.message || 'Error deleting post.');
      }
    });
  }

  onDeleteComment(commentId: number): void {
    // IMPORTANT: Replace confirm with a custom modal UI in a real app
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.PostService.deleteComment(commentId).subscribe({
      next: (res) => {
        console.log('Comment deleted:', res.message);
        this.loadPosts();
      },
      error: (err) => {
        console.error('Delete comment error:', err);
        // IMPORTANT: Replace alert with a custom modal UI in a real app
        alert(err.error?.message || 'Error deleting comment.');
      }
    });
  }

  openPostCreationModal(): void {
    if (this.isAuthenticated) {
      this.showPostCreationModal = true;
    } else {
      // IMPORTANT: Replace alert with a custom message box in a real app
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

    if (!commentForm) return;

    if (!this.isAuthenticated) {
      this.commentErrorMessages[postId] = 'You must be logged in to comment.';
      return;
    }

    if (commentForm.invalid) {
      this.commentErrorMessages[postId] = 'Comment must be at least 2 characters.';
      commentForm.markAllAsTouched();
      return;
    }

    const commentData: CreateCommentRequest = commentForm.value;

    this.PostService.makeComment(postId, commentData).subscribe({
      next: (res: CreateCommentBackendResponse) => {
        this.commentSuccessMessages[postId] = res.message;
        commentForm.reset();
        commentForm.markAsUntouched();
        commentForm.markAsPristine();
        this.loadPosts();
        setTimeout(() => this.commentSuccessMessages[postId] = null, 3000);
      },
      error: (error) => {
        this.commentErrorMessages[postId] = error.error?.message || 'Failed to post comment.';
        console.error('Error posting comment:', error);
        setTimeout(() => this.commentErrorMessages[postId] = null, 5000);
      }
    });
  }

  getCommentForm(postId: number): FormGroup {
    return this.commentForms[postId];
  }

  hasCommentError(postId: number, controlName: string, errorType: string): boolean {
    const form = this.commentForms[postId];
    return form?.get(controlName)?.touched && form.get(controlName)?.hasError(errorType) || false;
  }

  hasPostEditError(controlName: string, errorType: string): boolean {
    const control = this.postEditForm.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }

  hasCommentEditError(controlName: string, errorType: string): boolean {
    const control = this.commentEditForm.get(controlName);
    return control?.touched && control?.hasError(errorType) || false;
  }

  isAdmin(): boolean {
    return this.isAuthenticated && this.currentUser?.role_id === 1;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.AuthService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentUserId = null;
    this.router.navigate(['/login']);
  }
}
