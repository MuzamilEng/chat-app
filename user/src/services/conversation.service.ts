import { IBlockConv, ICreateConv } from 'src/interfaces/conversation';

import { APIRequest } from './api-request';

class ConversationService extends APIRequest {
  find(query?: any) {
    return this.get('/conversation', query);
  }

  findOne(id: string) {
    return this.get(`/conversation/${id}`);
  }

  create(data: ICreateConv) {
    return this.post('/conversation', data); 
  }

  deductBalance(data: any) {
    return this.post('/deductbalance', data); 
  }

  block(conversationId: string, data: IBlockConv) {
    return this.post(`/conversation/${conversationId}/block`, data);
  }

  unBlock(conversationId: string, data: IBlockConv) {
    return this.post(`/conversation/${conversationId}/unblock`, data);
  }

  findRecipient(conversationId: string) {
    return this.get(`/conversation/${conversationId}/recipient`);
  }

  delete(conversationId: string) {
    return this.del(`/conversation/${conversationId}`);
  }

  readMessage(conversationId: string) {
    return this.post(`/conversation/${conversationId}/read`);
  }

  getTotalUnreadmessage() {
    return this.get('/conversation/total-unread-message');
  }
}

export const conversationService = new ConversationService();
