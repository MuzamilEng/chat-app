import cookie from 'js-cookie';
import {
  ILogin, IRegister, IUpdateTokenPerMessage, IVerifyCode
} from 'src/interfaces/auth';

import { APIRequest } from './api-request';

const TOKEN = 'accessToken';
class AuthService extends APIRequest {
  login(data: ILogin) {
    return this.post('/auth/login', data);
  }

  doVerifyCode(data: IVerifyCode) {
    return this.post('/auth/verify/code', data);
  }

  setToken(token: string, isKeepLogin = true) {
    if (isKeepLogin) {
      cookie.set('accessToken', token, { expires: 365 });
    } else {
      cookie.set('accessToken', token);
    }
  }

  getToken() {
    const token = cookie.get(TOKEN);
    if (token) {
      return token;
    }
    return !token && process.browser ? localStorage.getItem(TOKEN) : null;
  }

  removeToken() {
    cookie.remove(TOKEN);
    localStorage.removeItem('isLoggedin');
  }

  me(headers?: { [key: string]: string }) {
    return this.get('/users/me', undefined, headers);
  } 

  register(data: IRegister) {
    return this.post('/auth/register', data);
  }
  checkEmail(data: any) {
    return this.post(`/users/email-verify`, data);
  }

  forgot(data: { email: string }) {
    return this.post('/auth/forgot', data);
  }

  isLoggedin() {
    return localStorage.getItem('isLoggedin') === 'yes';
  }

  updatePassword(data: any) {
    return this.post('/users/updatePassword', data);
  }

  updateDocument(data: any) {
    return this.post('/users/document', data);
  }

  deactiveProfile() {
    return this.put('/users/deactive');
  }

  updateProfile(data: any) {
    return this.put('/users/updateProfile', data);
  }

  updateTokenPerMessage(data: IUpdateTokenPerMessage) {
    return this.put('/users/token-per-message', data);
  }

  // /v1/update-nickname

  updateNickname(data: any) {
    return this.put('/update-nickname', data);
  }

  updateAvatar(data: any) {
    return this.post('/users/avatar', data);
  }
}

export const authService = new AuthService();
