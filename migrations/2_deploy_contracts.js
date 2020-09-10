const AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
const ProxyAdmin = artifacts.require("ProxyAdmin");
const V1 = artifacts.require("V1");
const V2 = artifacts.require("V2");

module.exports = async function (deployer, network, accounts) {
  if (network === "test") return;

  let impl = await V1.new();
  const encoded = impl.contract.methods.initialize(accounts[0], 10).encodeABI();
  const proxyAdmin = await deployer.deploy(ProxyAdmin);

  // DEPLOY PROXY
  const proxy = await deployer.deploy(
    AdminUpgradeabilityProxy,
    impl.address,
    proxyAdmin.address,
    encoded
  );

  // Logic contract
  const v1 = await V1.at(proxy.address);

  console.log("\nFetching admin variables...");
  const admin = await proxyAdmin.getProxyAdmin(proxy.address);
  console.log(admin, proxyAdmin.address);
  const owner = await proxyAdmin.owner();
  console.log(owner, accounts[0]);
  const implementation = await proxyAdmin.getProxyImplementation(proxy.address);
  console.log(implementation, impl.address);

  console.log("\nTesting logic variable...");
  let value = await v1.testVariable({ from: accounts[1] });
  console.log(String(value), 10);

  console.log("\nUpgrading implementation...");
  impl = await V2.new();
  await proxyAdmin.upgrade(proxy.address, impl.address);
  const v2 = await V2.at(proxy.address);

  console.log("\nFetching variables again...");
  const admin2 = await proxyAdmin.getProxyAdmin(proxy.address);
  console.log(admin2, proxyAdmin.address);
  const owner2 = await proxyAdmin.owner();
  console.log(owner2, accounts[0]);
  const implementation2 = await proxyAdmin.getProxyImplementation(
    proxy.address
  );
  console.log(implementation2, impl.address);

  console.log("\nTesting that storage is intact...");
  value = await v2.testVariable();
  console.log(String(value), 10); // still needs to be 10

  console.log("\nWhat if I change the variable directly in logic contract?");
  const logic = await V2.at(impl.address);
  await logic.setVariable(666);
  value = await logic.testVariable();
  console.log(String(value), 666);
  value = await v2.testVariable();
  console.log(String(value), 10);

  console.log("\nUpdating Storage");
  await v2.setVariable(55);
  value = await v2.testVariable();
  console.log(String(value), 55);
};
