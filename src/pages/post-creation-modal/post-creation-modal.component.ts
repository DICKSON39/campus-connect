import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostServiceService } from '../../services/post-service.service';
import { CreatePostBackendResponse } from '../../app/interface/post.interface';
import { HttpClient } from '@angular/common/http';

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
  isUploadingImage: boolean = false;
  previewUrl: string | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostServiceService,
    private http: HttpClient
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      image: [null] // optional image control
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImageFile);
    }
  }


  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.postForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.postForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.postForm.get('title')?.value);
    formData.append('content', this.postForm.get('content')?.value);

    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile); // "image" matches backend multer field
    }

    this.isUploadingImage = true;
    this.postService.createPost(formData).subscribe({
      next: (response: CreatePostBackendResponse) => {
        this.successMessage = response.message;
        this.postCreated.emit();
        this.resetForm();
        setTimeout(() => (this.successMessage = null), 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Post creation failed. Please try again.';
        console.error('Post creation error:', error);
        setTimeout(() => (this.errorMessage = null), 5000);
      },
      complete: () => {
        this.isUploadingImage = false;
      }
    });
  }

  resetForm(): void {
    this.postForm.reset();
    this.selectedImageFile = null;
    this.errorMessage = null;
    this.successMessage = null;
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
