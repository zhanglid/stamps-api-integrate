const expect = require("chai").expect;
const Stamp = require("./index");

const URL = "https://swsim.testing.stamps.com/swsim/swsimv75.asmx?WSDL";

const key = {
  IntegrationID: "142dc0eb-47cc-4b1a-82f0-73cecef49cdc",
  Username: "Lettopia-001",
  Password: "postage1"
};

const getClient = Stamp(URL, key);

describe("Singleton", () => {
  it("should create stampClient", async () => {
    const stampClient = await getClient();
    expect(stampClient).to.be.exist;
  });
});
