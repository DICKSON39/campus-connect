import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Adjust the import path to get CreatePostBackendResponse from the interfaces file
import { PostServiceService } from '../../services/post-service.service'; // Keep this for the service itself
import { CreatePostBackendResponse } from '../../app/interface/post.interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environment'; // Import it from interfaces

@Component({
  selector: 'app-post-creation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-creation-modal.component.html',
  styleUrls: ['./post-creation-modal.component.css']
})
export class PostCreationModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() isAuthenticated: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() postCreated = new EventEmitter<void>();

  postForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isUploadingImage: boolean = false; // NEW: Flag for image upload status
  imageUrl: string | null = null; // NEW: To store the uploaded image URL

  // Cloudinary credentials (only public ones, never API Secret)
  // Store these in your environment files (environment.ts, environment.prod.ts)
  private CLOUDINARY_CLOUD_NAME = environment.cloudinary.cloudName
  private CLOUDINARY_UPLOAD_PRESET = environment.cloudinary.uploadPreset;

  constructor(
    private fb: FormBuilder,
    private postService: PostServiceService,
    private http: HttpClient // Inject HttpClient
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // You might want to pre-populate content if editing a post, not just creating
    // For now, it's a create-only modal
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    this.isUploadingImage = true;
    this.errorMessage = null; // Clear previous errors
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.CLOUDINARY_UPLOAD_PRESET);

    // Direct upload to Cloudinary
    this.http.post(`https://api.cloudinary.com/v1_1/${this.CLOUDINARY_CLOUD_NAME}/image/upload`, formData)
      .subscribe({
        next: (response: any) => {
          this.imageUrl = response.secure_url; // Get the secure URL from Cloudinary
          this.isUploadingImage = false;
          this.successMessage = 'Image uploaded successfully!';
          // OPTIONAL: Immediately insert into content.
          // This is basic; a rich text editor would do this more gracefully.
          const currentContent = this.postForm.get('content')?.value || '';
          this.postForm.get('content')?.setValue(currentContent + `\n![Image](${this.imageUrl})\n`);
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error) => {
          console.error('Cloudinary upload error:', error);
          this.errorMessage = 'Image upload failed. Please try again.';
          this.isUploadingImage = false;
          setTimeout(() => this.errorMessage = null, 5000);
        }
      });
  }

  removeImage(): void {
    this.imageUrl = null;
    // You might want to remove the image tag from content here too
    const currentContent = this.postForm.get('content')?.value || '';
    // This is a naive removal, better to use regex if precise.
    const updatedContent = currentContent.replace(new RegExp(`\\n!\\[Image\\]\\(${this.escapeRegExp(this.imageUrl || '')}\\)\\n`), '');
    this.postForm.get('content')?.setValue(updatedContent);
  }

  // Helper function to escape special characters for regex
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the matched substring
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.postForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.postForm.markAllAsTouched();
      return;
    }

    const postData = {
      title: this.postForm.get('title')?.value,
      // Concatenate image URL if available, or handle within a rich text editor
      content: this.postForm.get('content')?.value,
    };

    this.postService.createPost(postData).subscribe({
      next: (response: CreatePostBackendResponse) => {
        this.successMessage = response.message;
        this.postCreated.emit(); // Notify parent component
        this.resetForm(); // Reset form after successful creation
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Post creation failed. Please try again.';
        console.error('Post creation error:', error);
        setTimeout(() => this.errorMessage = null, 5000);
      }
    });
  }

  resetForm(): void {
    this.postForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
    this.imageUrl = null;
    this.isUploadingImage = false;
  }

  onClose(): void {
    this.resetForm();
    this.close.emit();
  }

  hasError(controlName: string, errorType: string): boolean | undefined {
    const control = this.postForm.get(controlName);
    return control?.touched && control?.hasError(errorType);
  }
}
