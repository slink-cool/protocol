export interface SaveAttachmentCommand {
  attachment: Attachment;
}

export interface Attachment {
  name: string;
  description: string;
  type: string;
  value: any;
}

export interface PersistedAttachment {
  attachment: Attachment;
  metadata: AttachmentMetadata;
}

export interface AttachmentMetadata {
  uri: string;
  sha256: string;
}

export interface AttachmentStorage {
  save(command: SaveAttachmentCommand): Promise<PersistedAttachment>;

  findOne(uri: string): Promise<PersistedAttachment>;
}
