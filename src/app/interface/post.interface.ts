// src/app/interfaces/post.interface.ts

// Interface for a person (author or commenter)
export interface PersonDetails {
  id: string; // Assuming 'id' from person table can be string
  first_name: string;
  last_name: string;
  email: string;
}

// Interface for a single comment
export interface CommentItem {
  id: number;
  content: string;
  created_at?: string;
  commenter: PersonDetails; // Nest the commenter's details
}
export interface GetSinglePostBackendResponse {
  message: string;
  post: PostsItems; // The backend returns a single post object
}


// Interface for a single post item with author and comments
export interface PostsItems {
  id: number; // The post's ID (post_id from backend)
  title: string;
  content: string;
  created_at?: string;
  image_url?: string;
  updated_at?: string;
  author: PersonDetails; // Nest the author's details
  comments: CommentItem[]; // Array of comments for this post
}

// Interface for the entire backend response when fetching multiple posts
export interface GetPostsBackendResponse {
  message: string;
  posts: PostsItems[]; // This matches the 'posts' key in your JSON
}

// --- NEW: Interface for the backend response after creating a single post ---
export interface CreatePostBackendResponse {
  message: string;
  post: PostsItems; // The newly created post object (backend should return a full PostsItems object)
}

export interface CreatePostRequest {
  title: string;
  content: string;
  image_url?: string; // NEW: Optional image URL for creation
}


export interface CreateCommentRequest {
  content: string;
}

// NEW: Interface for the backend response after creating a comment
export interface CreateCommentBackendResponse {
  message: string;
  // Your backend returns `newResult` which contains id, post_id, content.
  // It doesn't return user_id, first_name, last_name, email in the immediate response.
  // We'll need to account for this in the frontend.
  // Let's define an interface for the `newResult` part of your backend response.
  newResult: {
    id: number;
    post_id: number;
    content: string;
    // Note: The backend's `newResult` does NOT include user_id, first_name, last_name, email.
    // So, we'll need to reload posts to get the full commenter details.
    // For now, let's reflect what your backend actually returns.
  }
}

