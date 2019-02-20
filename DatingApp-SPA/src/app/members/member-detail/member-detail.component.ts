import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { TabsetComponent } from 'ngx-bootstrap';


@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  user: User;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  @ViewChild('memberTabs') memberTabs: TabsetComponent;

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });

    this.route.queryParams.subscribe(params => {
      const selectedTab = params['tab'];
      if (selectedTab && selectedTab > 0) { this.selectTab(selectedTab); }
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

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }

}
