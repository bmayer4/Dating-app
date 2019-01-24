import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';


@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  constructor(private userService: UserService, private as: AlertifyService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });

  this.galleryOptions = [
    {
        width: '100%',
        height: '480px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
    }
  ];

  this.galleryImages = this.getImages();

}

getImages() {
  const imageUrls = [];
  for (const photo of this.user.photos) {
    imageUrls.push({
      small: photo.url,
      medium: photo.url,
      big: photo.url
    });
  }
  return imageUrls;
}

  // not using now that we added a resolver
  // loadUser() {
    // console.log(+this.route.snapshot.paramMap.get('id'));  // same
    // console.log(+this.route.snapshot.params['id']);
  //   this.userService.getUser(+this.route.snapshot.params['id'])
  //     .subscribe((user: User) => this.user = user,
  //     err => this.as.error(err));
  // }

}
