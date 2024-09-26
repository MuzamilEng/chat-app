import { APIRequest } from './api-request';

class MessageService extends APIRequest {
  getList(data: any) {
    return this.get(this.buildUrl('/messages/all-messages', data));
  }

  find(conversationId: any, query?: any) {
    return this.get(`/messages/${conversationId}`, query);
  }

  send(data: any) {
    return this.post('/messages', data);
  }

  findConversation(data: any) {
    return this.get(this.buildUrl('/conversation/findConversationByMembers', data));
  }

}

export const messageService = new MessageService();
