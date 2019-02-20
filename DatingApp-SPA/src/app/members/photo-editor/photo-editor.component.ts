import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';  // angular will select env we are in
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() changeCurrentPhotoUrl = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  currentMain: Photo;

  constructor(private authService: AuthService, private userService: UserService, private as: AlertifyService) { }

  ngOnInit() {
    this.initializeUploadeder();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploadeder() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize:  10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };  // fixes cors issue

    this.uploader.onSuccessItem = (item, response, status, header) => {
      if (response) {  // response is string, JSON.Parse converts it into object (because photo is an object)
        console.log('res', response); // is from api
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain  // api sets it to main if first photo
        };
        this.photos.push(photo);
        if (photo.isMain) {   // important for first photo uploaded to show instantly througout app (lec 130)
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      // find returns after it satisfies, better than filter which loops through everything
      // this works since arrays are passed by reference
      this.currentMain = this.photos.find(p => p.isMain === true);
      this.currentMain.isMain = false;
      photo.isMain = true;

      // this.changeCurrentPhotoUrl.emit(photo.url);  // for demo, not doing this since adding behavior subject

      this.authService.changeMemberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));  // database was updated but were staying logged in
    }, err => {
      this.as.error(err);
    });
  }

  deletePhoto(id: number) {
    this.as.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        const photoIndex = this.photos.findIndex(p => p.id === id);
        this.photos.splice(photoIndex, 1);    // could use filter
        this.as.success('Photo deleted');
      }, err => this.as.error('Failed to delete the photo'));
    });
  }
}
