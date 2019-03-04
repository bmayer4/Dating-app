import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { Photo } from '../_models/photo';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
baseUrl = environment.apiUrl;

constructor(private http: HttpClient) {}

getUsersWithRoles() {
  return this.http.get(this.baseUrl + 'admin/usersWithRoles');
}

updateUserRoles(user: User, roles: object) {
  return this.http.post(this.baseUrl + 'admin/editRoles/' + user.username, roles);
}

getUnnaprovedPhotos(): Observable<Photo[]> {
  return this.http.get<Photo[]>(this.baseUrl + 'admin/photosForModeration');
}

approvePhoto(photoId: number) {
  return this.http.patch(this.baseUrl + 'admin/photos/' + photoId + '/approve', {});
}

rejectPhoto(photoId: number) {
  return this.http.delete(this.baseUrl + 'admin/photos/' + photoId + '/reject');
}

}
