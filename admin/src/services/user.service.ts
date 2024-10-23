import { APIRequest } from './api-request';

class UserService extends APIRequest {
  find(params?: any) {
    return this.get(this.buildUrl('/users/search', params));
  }

  create(data: any) {
    return this.post('/users', data);
  }

  me() {
    return this.get('/users/me');
  }

  updateMe(data: any) {
    return this.put('/users/', data);
  }

  findOne(id: string) {
    return this.get(`/users/${id}`);
  }

  update(id: string, data: any) {
    return this.put(`/users/${id}`, data);
  }

  updateVerificationDocument(id: string, data: any) {
    return this.put(`/users/${id}/verification/document/`, data);
  }

  remove(id: string) {
    return this.del(`/users/${id}`);
  }

  getProfilePhotos(data: any) {
    return this.get(this.buildUrl('/media/search', data));
  }
  addSecretInfo(data: any) {
    return this.post('/update-secret-info', data);
  }
  // get-secret-info/:conversationId

  getSecretInfo(conversationId: any) {
    return this.get(`/get-secret-info/${conversationId}`);
  }
  
  // users/approve-avatar
  
    approveAvatar(data: any) {
      return this.post('/users/approve-avatar', data);
    }
}
export const userService = new UserService();
