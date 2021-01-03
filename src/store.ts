import { BufferStreamReader, BufferStreamWriter } from "@vigcoin/serializer";
import { IPeerEntry, uint32, uint64, UINT64, uint8 } from "@vigcoin/types";
import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  writeFileSync
} from "fs";

export interface IP2PStorage {
  version: uint8;
  id: Buffer;
  peers: {
    version: uint8;
    white: IPeerEntry[];
    gray: IPeerEntry[];
  };
}

export class Store {
  private file: string;
  constructor(file: string) {
    this.file = file;
    if (!existsSync(this.file)) {
      closeSync(openSync(this.file, "w+"));
    }
  }

  public write(storage: IP2PStorage) {
    const writer = new BufferStreamWriter(Buffer.alloc(0));
    writer.writeVarint(storage.version);
    writer.writeVarint(storage.peers.version);
    this.writePeerEntryList(writer, storage.peers.white);
    this.writePeerEntryList(writer, storage.peers.gray);
    writer.writeVarintBuffer(storage.id);
    writeFileSync(this.file, writer.getBuffer());
  }

  public read(): IP2PStorage {
    const buffer: Buffer = readFileSync(this.file);
    const reader = new BufferStreamReader(buffer);
    const version = reader.readVarint();
    const peersVersion = reader.readVarint();
    const white = this.readPeerEntryList(reader);
    const gray = this.readPeerEntryList(reader);

    const id = reader.readVarintBuffer();

    return {
      id,
      peers: {
        gray,
        version: peersVersion,
        white
      },
      version
    };
  }

  private writePeerEntryList(writer: BufferStreamWriter, list: IPeerEntry[]) {
    writer.writeVarint(list.length);
    for (const item of list) {
      this.writePeerEntry(writer, item);
    }
  }

  private writePeerEntry(writer: BufferStreamWriter, pe: IPeerEntry) {
    writer.writeVarint(pe.peer.ip);
    writer.writeVarint(pe.peer.port);
    writer.writeVarintBuffer(pe.id);
    writer.writeVarint(Math.floor(pe.lastSeen.getTime() / 1000));
  }

  private readPeerEntryList(reader: BufferStreamReader): IPeerEntry[] {
    const size = reader.readVarint();
    const list = [];
    for (let i = 0; i < size; i++) {
      const pe = this.readPeerEntry(reader);
      list.push(pe);
    }
    return list;
  }

  private readPeerEntry(reader: BufferStreamReader): IPeerEntry {
    const ip: uint32 = reader.readVarint();
    const port: uint32 = reader.readVarint();
    const id: UINT64 = reader.readVarintUInt64();
    const lastSeen: uint64 = reader.readVarint();
    return {
      id,
      peer: {
        ip,
        port
      },
      // tslint:disable-next-line:object-literal-sort-keys
      lastSeen: new Date(lastSeen * 1000)
    };
  }
}
