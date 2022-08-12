export interface SaveAttachmentCommand<T> {
  attachment: Attachment<T>;
}

export interface Attachment<T> {
  name: string;
  description: string;
  type: string;
  payload: T;
}

export interface PersistedAttachment<T> {
  attachment: Attachment<T>;
  metadata: AttachmentMetadata;
}

export interface AttachmentMetadata {
  uri: string;
  sha256: Uint8Array;
}

export interface AttachmentStorage {
  save<T>(command: SaveAttachmentCommand<T>): Promise<PersistedAttachment<T>>;

  findOne<T>(uri: string): Promise<PersistedAttachment<T>>;
}
