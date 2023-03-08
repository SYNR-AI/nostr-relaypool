export class WriteRelaysPerPubkey {
  data: Map<string, string[]>;
  promises: Map<string, Promise<string[]>>;
  servers: string[];
  constructor(servers?: string[]) {
    this.data = new Map();
    this.promises = new Map();
    this.servers = servers || ["https://us.rbr.bio", "https://eu.rbr.bio"];
  }

  async get(pubkey: string) {
    if (this.data.has(pubkey)) {
      return Promise.resolve(this.data.get(pubkey));
    }
    if (this.promises.has(pubkey)) {
      return this.promises.get(pubkey);
    }
    const rs = [];
    for (let server of this.servers) {
      rs.push(fetchWriteRelays(server, pubkey));
    }
    const r = Promise.race(rs);
    r.then((x) => {
      this.data.set(pubkey, x);
      this.promises.delete(pubkey);
    });
    this.promises.set(pubkey, r);
    return r;
  }
}

function fetchWriteRelays(server: string, pubkey: string) {
  const url = `${server}/${pubkey}/writerelays.json`;
  return fetchJSON(url);
}

async function fetchJSON(url: string) {
  return fetch(url)
    .then((response) => response.json())
    .catch((e) => {
      throw new Error("error fetching " + url + " " + e);
    });
}
