const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const ProxyAdmin = artifacts.require("ProxyAdmin");
const V1 = artifacts.require("V1");
const V2 = artifacts.require("V2");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Proxy", ([owner, newOwner, random]) => {
  let impl;
  let proxyAdmin;
  let proxy;
  let contract;

  before(async function () {
    impl = await V1.new();
    proxyAdmin = await ProxyAdmin.new();

    const encoded = impl.contract.methods.initialize(owner, 10).encodeABI();

    // DEPLOY PROXY
    proxy = await AdminUpgradeabilityProxy.new(
      impl.address,
      proxyAdmin.address,
      encoded
    );

    // Logic contract
    contract = await V1.at(proxy.address);
  });

  describe("Initial Values", () => {
    it("should return correct proxyAdmin owner", async function () {
      const _owner = await proxyAdmin.owner();
      assert.equal(_owner, owner);
    });

    it("should return correct proxy admin", async function () {
      const admin = await proxyAdmin.getProxyAdmin(proxy.address);
      assert.equal(admin, proxyAdmin.address);
    });

    it("should return correct proxy implementation", async function () {
      const implementation = await proxyAdmin.getProxyImplementation(
        proxy.address
      );
      assert.equal(implementation, impl.address);
    });

    it("should get correct value in storage", async function () {
      const value = await contract.testVariable();
      assert.equal(value, 10);
    });
  });

  describe("Upgrading", () => {
    before(async function () {
      impl = await V2.new();
      await proxyAdmin.upgrade(proxy.address, impl.address); // can also use upgradeAndCall if there is some initialization to do
      contract = await V2.at(proxy.address);
    });

    it("should return correct proxy implementation", async function () {
      const implementation = await proxyAdmin.getProxyImplementation(
        proxy.address
      );
      assert.equal(implementation, impl.address);
    });

    it("should still get same value in storage", async function () {
      const value = await contract.testVariable();
      assert.equal(value, 10);
    });

    it("should return 0 for the logic contract storage value", async function () {
      const value = await impl.testVariable();
      assert.equal(value, 0);
    });

    it("should be able to change storage value", async function () {
      await contract.setVariable(55);
      value = await contract.testVariable();
      assert.equal(value, 55);
    });
  });

  describe("Checks", () => {
    it("should get correct storage if logic contract is altered", async function () {
      await impl.setVariable(111);
      value = await impl.testVariable();
      assert.equal(value, 111);

      value = await contract.testVariable();
      assert.equal(value, 55);
    });

    it("should only upgrade implementation from owner account", async function () {
      impl = await V2.new();
      await expectRevert(
        proxyAdmin.upgrade(proxy.address, impl.address, { from: random }),
        "revert"
      ); // can also use upgradeAndCall if there is some initialization to do
    });
  });
});
