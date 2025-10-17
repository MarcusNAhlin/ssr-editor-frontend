import { User } from './user';
export interface Document {
  _id?: string,
  title: string,
  content: string,
  type: 'code' | 'richtext',
  owner?: string,
  sharedWith?: User[],
}

export interface GqlResDoc { 
  data: { document: Document },
   errors?: { message: string }[]
}

export interface GqlResDocs {
  data: { documents: Document[] },
   errors?: { message: string }[] 
}
