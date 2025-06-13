import { Component,OnInit } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {UserService} from '../../services/user-service';
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  user: any = {};
  loading: boolean = false;

  constructor(private userService:UserService,private route:ActivatedRoute) {

  }

  ngOnInit(): void {
    const userId = +this.route.snapshot.paramMap.get('id')!;
    this.getUserById(userId);
  }

  getUserById(userId:number){
    this.userService.getUserById(userId).subscribe((data)=> {
      this.user = data;
    })
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




    }
