import type {
  AttachmentStorage,
  PersistedAttachment,
  SaveAttachmentCommand,
} from '../src/program/storage-api';
import { hash } from '@project-serum/anchor/dist/cjs/utils/sha256';

export class InMemoryAttachmentStorage implements AttachmentStorage {
  private readonly storage: Map<string, PersistedAttachment<any>> = new Map<
    string,
    PersistedAttachment<any>
  >();

  async findOne<T>(uri: string): Promise<PersistedAttachment<T>> {
    const persistedAttachment = this.storage.get(uri);
    if (!persistedAttachment) {
      throw new Error(`Attachment not found: ${uri}`);
    }
    return persistedAttachment as PersistedAttachment<T>;
  }

  async save<T>(
    command: SaveAttachmentCommand<T>,
  ): Promise<PersistedAttachment<T>> {
    const attachmentJson = JSON.stringify(command.attachment);
    const sha256 = hash(attachmentJson);
    const uri = sha256;
    const peristedAttachment: PersistedAttachment<T> = {
      attachment: command.attachment,
      metadata: {
        sha256: new TextEncoder().encode(sha256),
        uri,
        accountAddress: command.attachment.accountPda,
      },
    };
    this.storage.set(uri, peristedAttachment);
    return peristedAttachment;
  }
}
