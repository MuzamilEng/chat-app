export interface IUser {
  _id: string;
  username: string;
  bio: string;
  gender: string;
  description: string;
  avatar: string;
  type: string;
  balance: number;
  avatarUrl: string;
  shareLove: number;
  lastActivity: string;
  nickname: string;
}

export interface IContact {
  email: string;
  message: any;
  name: string;
}
