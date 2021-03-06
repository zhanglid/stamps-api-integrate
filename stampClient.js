const soap = require("soap");
const _ = require("lodash");

class StampClient {
  constructor(url) {
    this.URL = url;
  }

  async refreshAuthenticator() {
    return (this.authenticator = _.get(
      await this.client.AuthenticateUserAsync({
        Credentials: this.credentials
      }),
      "[0].Authenticator"
    ));
  }

  async init(credentials) {
    this.credentials = credentials;
    this.client = await soap.createClientAsync(this.URL);
    if (!this.client) {
      throw new Error(`Error create client`);
    }

    await this.refreshAuthenticator();

    _.keys(this.client).forEach(funcName => {
      if (/.*Async$/.test(funcName)) {
        const name = /(.*)Async$/.exec(funcName)[1];
        this[_.lowerFirst(name)] = async params => {
          const res = await this.client[funcName]({
            Authenticator: this.authenticator,
            ...params
          });
          const { Authenticator, ...rest } = _.get(res, "[0]");
          this.authenticator = Authenticator;
          return rest;
        };
      }
    });

    this.account = await this.getAccountInfo();
  }

  async getPostageBalance() {
    this.account = await this.getAccountInfo();
    return _.get(this.account, "AccountInfo.PostageBalance");
  }

  async queryRates(rate) {
    rate = _.mapValues(_.pickBy(rate, v => v != null), (v, k) => {
      if (v instanceof Date) {
        return v.toISOString().slice(0, 10);
      } else if (/.*Date$/.test(v)) {
        return v.slice(0, 10);
      }
      return v;
    });
    const res = await this.getRates({ Rate: rate });
    return res.Rates.Rate;
  }

  async getCleanse({ from, to }) {
    const Address = _.pickBy(
      {
        FullName: to.name,
        Address1: to.line1,
        Address2: to.line2,
        City: to.city,
        State: to.state,
        ZIPCode: to.zip.slice(0, 5)
      },
      value => value != null
    );

    const FromZIPCode = from.zip.slice(0, 5);

    const res = await this.cleanseAddress({ Address, FromZIPCode });
    return {
      cleanseAddress: res.Address,
      rates: res.Rates.Rate
    };
  }

  async createLabel({ from, cleanseAddress, rate, id, memo }) {
    const From = _.pickBy(
      {
        FullName: from.name,
        Address1: from.line1,
        Address2: from.line2,
        City: from.city,
        State: from.state,
        ZIPCode: from.zip.slice(0, 5)
      },
      v => v != null
    );

    const To = _.pickBy(cleanseAddress, v => v != null);

    const Rate = _.mapValues(_.pickBy(rate, v => v != null), v => {
      if (v instanceof Date) {
        return rate.ShipDate.toISOString().slice(0, 10);
      }
      return v;
    });

    const res = await this.createIndicium({
      IntegratorTxID: id,
      Rate,
      From,
      To,
      memo
    });
    return res;
  }
}

module.exports = StampClient;
