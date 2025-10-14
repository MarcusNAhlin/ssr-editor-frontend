export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  resolved: boolean;
  relativePos?: Uint8Array;
  selectionLength?: number;
}

export interface QuillCursorsModule {
  createCursor: (id: string, name: string, color: string) => void;
  moveCursor: (id: string, range: { index: number; length: number }) => void;
  removeCursor: (id: string) => void;
}
