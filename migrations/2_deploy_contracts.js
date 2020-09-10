const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const ProxyAdmin = artifacts.require("ProxyAdmin");
const V1 = artifacts.require("V1");

module.exports = async function (deployer, network, accounts) {
  if (network === "test") return;

  let impl = await V1.new();
  const encoded = impl.contract.methods.initialize(accounts[0], 10).encodeABI();
  const proxyAdmin = await deployer.deploy(ProxyAdmin);

  // DEPLOY PROXY
  await deployer.deploy(
    AdminUpgradeabilityProxy,
    impl.address,
    proxyAdmin.address,
    encoded
  );
};
