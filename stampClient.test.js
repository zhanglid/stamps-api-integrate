const StampClient = require("./stampClient");
const expect = require("chai").expect;

const URL = "https://swsim.testing.stamps.com/swsim/swsimv75.asmx?WSDL";

const key = {
  IntegrationID: "142dc0eb-47cc-4b1a-82f0-73cecef49cdc",
  Username: "Lettopia-001",
  Password: "postage1"
};

describe("StampClient", () => {
  let stampClient;
  before(async () => {
    stampClient = new StampClient(URL);
    await stampClient.init(key);
  });
  it("should have client prop", () => {
    expect(stampClient.client).to.be.exist;
  });

  it("should have authentication field", () => {
    expect(stampClient.authenticator).to.be.exist;
  });

  it("should have account field", () => {
    expect(stampClient.account).to.be.exist;
  });

  it("getPostageBalance should have PostageBalance", async () => {
    const res = await stampClient.getPostageBalance();
    expect(res).to.has.keys(["AvailablePostage", "ControlTotal"]);
  });

  it("shoud set autobuy", async () => {
    const res = await stampClient.setAutoBuy({
      AutoBuySettings: {
        AutoBuyEnabled: true,
        PurchaseAmount: 200,
        TriggerAmount: 100
      }
    });

    expect(res).to.be.exist;
  });

  it("query rates should get the rates array", async () => {
    const res = await stampClient.queryRates({
      FromZIPCode: "90007",
      ToZIPCode: "90066",
      WeightLb: 12,
      PackageType: "Package",
      ShipDate: "2019-02-12",
      InsuredValue: 0
    });
    expect(res).to.be.an("array");
  });

  it("refreshAuthenticator should refetch account and authenticator", async () => {
    stampClient.authenticator = null;
    await stampClient.refreshAuthenticator();
    expect(stampClient.authenticator).to.be.exist;
  });

  describe("create label", () => {
    const to = {
      name: "David Deschamps",
      city: "Florence",
      state: "MT",
      country: "US",
      zip: "59833-22",
      line1: "6326 Lamar Trl",
      line2: null
    };

    const from = {
      line1: "Bay 3",
      line2: "13060 Temple Ave",
      city: "City of Industry",
      state: "CA",
      zip: "91745-22",
      country: "us"
    };

    let cleanseResult;
    it("getCleanse get cleanseHash and rates", async () => {
      const res = await stampClient.getCleanse({ from, to });
      expect(res.cleanseAddress).to.exist;
      expect(res.rates).to.be.an("array");
      cleanseResult = res;
    });

    it("create label should return created label", async () => {
      const rate = cleanseResult.rates[0];
      const orderId = "5b47ecc5531ff45a35e0282b";
      const res = await stampClient.createLabel({
        from,
        cleanseAddress: cleanseResult.cleanseAddress,
        rate,
        id: orderId,
        memo: "123412345"
      });
      expect(res.URL).to.be.an("string");
    });
  });
});
