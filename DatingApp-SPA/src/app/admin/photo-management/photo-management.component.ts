import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/_services/admin.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { Photo } from 'src/app/_models/photo';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  unapprovedPhotos: Photo[];

  constructor(private adminService: AdminService, private as: AlertifyService) { }

  ngOnInit() {
    this.adminService.getUnnaprovedPhotos().subscribe(photos => {
      this.unapprovedPhotos = photos;
    }, err => this.as.error(err));
  }

  approvePhoto(photoId: number) {
    // alert(photoId);
    this.adminService.approvePhoto(photoId).subscribe(() => {
      this.unapprovedPhotos = this.unapprovedPhotos.filter(p => p.id !== photoId);
      this.as.success(`photo with id ${photoId} approved`);
    }, err => this.as.error(err));
  }

  rejectPhoto(photoId: number) {
    // alert(photoId);
    this.adminService.rejectPhoto(photoId).subscribe(() => {
      this.unapprovedPhotos = this.unapprovedPhotos.filter(p => p.id !== photoId);
      this.as.success(`photo with id ${photoId} deleted`);
    }, err => this.as.error(err));
  }

}
