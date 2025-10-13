export interface Comment {
  id: string;
  line: number;
  text: string;
  author: string;
  timestamp: number;
  resolved: boolean;
}
