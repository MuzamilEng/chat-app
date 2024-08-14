import { APIRequest } from './api-request';

class MessageService extends APIRequest {
  getList(data: any) {
    return this.get(this.buildUrl('/messages/all-messages', data));
  }

  find(conversationId: any, query?: any) {
    return this.get(`/messages/all-message/${conversationId}`, query);
  }

  findConversation(data: any) {
    return this.get(this.buildUrl('/conversation/findConversationByMembers', data));
  }

}

export const messageService = new MessageService();
