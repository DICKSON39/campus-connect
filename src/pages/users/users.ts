import { Component,OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import {PaginatedUsers, User, UserService} from '../../services/user-service';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Modal} from '../modal/modal'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  imports: [CommonModule,RouterLink,FormsModule,Modal],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit{
  users:User[]=[];
  showModal: boolean = false;
  selectedUserId!: number;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10; // Number of items per page
  totalItems: number = 0;
  totalPages: number = 0;

  userSearchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient,private router: Router,private userService:UserService,private snackBar:MatSnackBar) {
  }



  ngOnInit(): void {
    this.fetchUsers();

    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait for 300ms after the last keystroke
        distinctUntilChanged(), // Only emit if the current value is different from the last
      )
      .subscribe(() => {
        this.currentPage = 1; // Reset to first page on new search
        this.fetchUsers();
      });
  }


  fetchUsers(): void {
    this.userService
      .getUsers(this.currentPage, this.pageSize, this.userSearchTerm)
      .subscribe((paginatedData: PaginatedUsers) => {
        this.users = paginatedData.items;
        this.totalItems = paginatedData.totalItems;
        this.totalPages = paginatedData.totalPages;
      });
  }



  getRoleName(role_id: number): string {
    switch (role_id) {
      case 1:
        return 'Admin';
      case 2:
        return 'User';
      case 3:
        return 'Dickson';
      default:
        return 'Unknown';
    }
  }

  deleteUser(userId: number) {
    this.selectedUserId = userId;
    this.showModal = true;
  }

  confirmDelete(): void {
    if (this.selectedUserId) {
      this.userService.deleteUser(this.selectedUserId).subscribe({
        next: () => {
          this.snackBar.open('✅ User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          // After deletion, re-fetch users, possibly adjusting current page if the last item on a page was deleted
          if (this.users.length === 1 && this.currentPage > 1) {
            this.currentPage--; // Go to previous page if the last item on current page was deleted
          }
          this.fetchUsers();
        },
        error: () => {
          this.snackBar.open('❌ Failed to delete user', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    }
    this.showModal = false;
  }

  cancelDelete():void{
    this.showModal = false
  }

  // --- Pagination Methods ---

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.fetchUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchUsers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchUsers();
    }
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.currentPage = 1; // Reset to first page when page size changes
    this.fetchUsers();
  }

  onSearchTermChange(event: Event): void {
    this.userSearchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(this.userSearchTerm); // Emit search term to the subject
  }



}
