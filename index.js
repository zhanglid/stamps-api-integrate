const StampClient = require("./stampClient");

function StampClientSingleton(url, key) {
  this._url = url;
  this._key = key;
  return async () => {
    if (this.client) {
      return this.client;
    }
    this.client = new StampClient(this._url);
    await this.client.init(this._key);
    return this.client;
  };
}

module.exports = StampClientSingleton;
