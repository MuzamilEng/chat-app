import { IContact } from '../interfaces/user';
import { APIRequest } from './api-request';

class UserService extends APIRequest {
  // todo - remove
  me() {
    return this.get('/users/me');
  }

  findByUsername(username) {
    return this.get(`/users/findByUsername/${username}`);
  }

  // todo - update get otp code
  getOTP() {
    return this.get('/users/otp/');
  }

  find(data: any) {
    return this.get('/users/search', data);
  }

  findDefault(data: any) {
    return this.get('/users/default-search', data);
  }

  getFriends(data: any) {
    return this.get('/users/search-friend', data);
  }

  contactAdmin(data: IContact) {
    return this.post('/contact-us', data);
  }
}

export const userService = new UserService();
