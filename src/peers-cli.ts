#!/usr/bin/env node

import { resolve } from "path";
import { IP2PStorage, Store } from "./store";
import { existsSync, statSync } from "fs";
import { IP } from "@vigcoin/util";
import * as moment from 'moment';

const Qqwry = require("lib-qqwry2");
const qwry = Qqwry.init();

const [, , ...pathes] = process.argv;
for (const path of pathes) {
  const absPath = resolve(process.cwd(), path);
  // tslint:disable-next-line: no-console
  console.log('Reading file = "' + absPath + '"');
  let file = resolve(absPath, "./p2pstate.bin");
  if (!existsSync(file)) {
    file = absPath;
    const stat = statSync(file);
    if (!stat.isFile()) {
      console.log("file not found");
    }
  }

  const store = new Store(file);

  const ips: IP2PStorage = store.read();
  console.log("Read P2PServer version : " + ips.version);

  console.log("Read peer manager version : " + ips.peers.version);
  console.log("Read white peers (" + ips.peers.white.length + ")");
  ips.peers.white.forEach(item => {
    const ip = IP.toString(item.peer.ip);
    const address = qwry.searchIP(ip);
    console.log(
      "Read peer entry " +
        ip +
        "(" +
        address.Country +
        "-" +
        address.Area +
        ")" +
        ":" +
        item.peer.port +
        ", last seen: " +
        moment(item.lastSeen).format("YYYY-MM-DD HH:mm:ss") +
        ", id: " +
        item.id.toString("hex")
    );
    console.log("Read P2PServer peer id : " + ips.id.toString("hex"));
  });
  console.log("Read gray peers (" + ips.peers.gray.length + ")");
  ips.peers.gray.forEach(item => {
    const ip = IP.toString(item.peer.ip);
    const address = qwry.searchIP(ip);
    console.log(
      "Read peer entry " +
        ip +
        "(" +
        address.Country +
        "-" +
        address.Area +
        ")" +
        ":" +
        item.peer.port +
        ", last seen: " +
        moment(item.lastSeen).format("YYYY-MM-DD HH:mm:ss") +
        ", id: " +
        item.id.toString("hex")
    );
    console.log("Read P2PServer peer id : " + ips.id.toString("hex"));
  });
}
