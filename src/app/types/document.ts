import { User } from './user';
export interface Document {
  _id?: string,
  title: string,
  content: string,
  type: 'code' | 'richtext',
  owner?: string,
  sharedWith?: User[],
}
