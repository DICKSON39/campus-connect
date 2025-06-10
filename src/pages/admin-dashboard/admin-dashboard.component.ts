import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {GetPostsBackendResponse, PostsItems} from '../../app/interface/post.interface';
import {PostServiceService} from '../../services/post-service.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {

  adminTasks = [
    'User Management',
    'Content Moderation',

  ];

  allPosts: PostsItems[] = []; // To store all posts for admin review

  constructor(private postService: PostServiceService) { }

  ngOnInit(): void {
    this.loadAllPosts();
  }

  loadAllPosts(): void {
    this.postService.getPosts().subscribe({
      next: (response: GetPostsBackendResponse) => {
        this.allPosts = response.posts;
        console.log('All posts loaded for admin:', this.allPosts);
      },
      error: err => {
        console.error('Error fetching all posts for admin dashboard:', err);
        // Handle error, e.g., display a message
      }
    });
  }

  // Admin specific method to delete a post
  onDeletePost(postId: number): void {
    console.log('Attempting to delete post with ID:', postId)
    if (!confirm('Are you absolutely sure you want to delete this post? This action is irreversible.')) {
      return;
    }

    this.postService.deletePost(postId).subscribe({
      next: (response) => {
        console.log('Post deleted successfully by admin:', response.message);
        this.loadAllPosts(); // Reload posts to update the view
      },
      error: (error) => {
        console.error('Admin Error deleting post:', error);
        alert(error.error?.message || 'Failed to delete post.');
      }
    });
  }

  // Admin specific method to delete a comment
  onDeleteComment(commentId: number): void {

    if (!confirm('Are you absolutely sure you want to delete this comment? This action is irreversible.')) {
      return;
    }

    this.postService.deleteComment(commentId).subscribe({
      next: (response) => {
        console.log('Comment deleted successfully by admin:', response.message);
        this.loadAllPosts(); // Reload posts (and thus comments) to update the view
      },
      error: (error) => {
        console.error('Admin Error deleting comment:', error);
        alert(error.error?.message || 'Failed to delete comment.');
      }
    });
  }
}
