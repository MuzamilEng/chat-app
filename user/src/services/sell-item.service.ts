import { IGetSellItem } from 'src/interfaces/sell-item';

import { APIRequest } from './api-request';

class SellItemService extends APIRequest {
  createSellItem(data: any) {
    return this.post('/sell-item', data);
  } 
  createBlogPost(data: any) {
    return this.post('/blog-post', data);
  }
 
  getAllBlogs(userId) {
    return this.get(`/blogs/${userId}`);
  }
  
// get profile video
getProfileVidoe(id) {
  return this.get(`/getProfileVideo/${id}`);
}
  getBlogById(id) {
    return this.get(`/getBlogPost/${id}`);
  }
  // user get sell item of model
  getModelSellItem(data: IGetSellItem) {
    return this.get('/sell-item/model', data as any);
  }
  getModelSellItems(data: IGetSellItem) {
    return this.get('/sell-items/model', data as any);
  }

  // default
  getDefaultModelSellItems(data: IGetSellItem) {
    return this.get('/default-sell-items/model', data as any);
  }

  getMySellItem(data: IGetSellItem) {
    return this.get('/sell-item/me', data as any);
  }
  getMyPendingItem(data: IGetSellItem) {
    return this.get('/pending-item/me', data as any);
  }
  getMyPendingVideoItem(data: IGetSellItem) {
    return this.get('/pending-videoItem/me', data as any);
  }
  updateSellItem(id: string, data: any) {
    return this.put(`/sell-item/${id}`, data);
  }

  removeSellItem(id: string) {
    return this.del(`/sell-item/${id}`);
  }

  // folder services
    createFolder(data: any) {
      return this.post('/create-folder', data);
    }

    getFolders() {
      return this.get('/folders');
    } 
    
    getFolderImages() {
      return this.get('/folder-images');
    }

    //     '/v1/getAllLikedVideos',

    getAllLikedVideos() {
      return this.get('/getAllLikedVideos');
    }

    updateLikes(data: any) {
      return this.post('/update-likes', data);
    }

    sendFriendRequest(data: any) {
      return this.post('/send-friend-request', data);
    }

    getAllFriendRequests(userId: string ) {
      return this.get(`/friend-requests/${userId}`);
    }

    updateFriendRequest(data: any) {
      return this.put('/update-friend-request', data);
    }
    // /v1/update-interests/:userId
    updateInterests(data: any ) {
      return this.put(`/update-interests`, data);
    }
}



export const sellItemService = new SellItemService();
