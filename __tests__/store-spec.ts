import { IP } from '@vigcoin/util';
import { unlinkSync } from 'fs';
import * as moment from 'moment';

const Qqwry = require('lib-qqwry2');
// import * as assert from "assert";
// import { existsSync, readFileSync, unlinkSync } from "fs";
import * as path from 'path';
import { IP2PStorage, Store } from '../src';

const qwry = Qqwry.init();

describe('test peer server', () => {
  const p2pFile = path.resolve(__dirname, './data/p2pstate.bin');
  const p2pFileNew = path.resolve(__dirname, './data/p2pstate.bin.new');
  it('should read/write p2p state file 1', () => {
    const store = new Store(p2pFile);
    const ips: IP2PStorage = store.read();
    console.log(ips);

    console.log('Read P2PServer version : ' + ips.version);

    console.log('Read peer manager version : ' + ips.peers.version);
    console.log('Read white peers (' + ips.peers.white.length + ')');
    ips.peers.white.forEach(item => {
      const ip = IP.toString(item.peer.ip);
      const address = qwry.searchIP(ip);
      console.log(
        'Read peer entry ' +
          ip +
          '(' +
          address.Country +
          '-' +
          address.Area +
          ')' +
          ':' +
          item.peer.port +
          ', last seen: ' +
          moment(item.lastSeen).format('YYYY-MM-DD HH:mm:ss') +
          ', id: ' +
          item.id.toString('hex')
      );
      console.log('Read P2PServer peer id : ' + ips.id.toString('hex'));
    });
    console.log('Read gray peers (' + ips.peers.gray.length + ')');
    ips.peers.gray.forEach(item => {
      const ip = IP.toString(item.peer.ip);
      const address = qwry.searchIP(ip);
      console.log(
        'Read peer entry ' +
          ip +
          '(' +
          address.Country +
          '-' +
          address.Area +
          ')' +
          ':' +
          item.peer.port +
          ', last seen: ' +
          moment(item.lastSeen).format('YYYY-MM-DD HH:mm:ss') +
          ', id: ' +
          item.id.toString('hex')
      );
      console.log('Read P2PServer peer id : ' + ips.id.toString('hex'));
    });

    const writer = new Store(p2pFileNew);
    writer.write(ips);

    unlinkSync(p2pFileNew);
  });
});
