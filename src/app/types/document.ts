import { User } from './user';
export interface Document {
  _id?: string,
  title: string,
  content: string,
  owner?: string,
  sharedWith?: User[],
}
