const path = require('path');
const fs = require('fs');
const solc = require('solc');
process.removeAllListeners("uncaughtException");
const Web3 = require('web3');
const web3 = new Web3();

const config = require('./config');

web3.setProvider(
  new web3.providers.HttpProvider(config.ETH_CLIENT));

const contracts = {};

function getAccount(index) {
  return web3.eth.accounts[index];
}


function registerContract(contractName, source, sender) {
  const compiledContract = solc.compile(source, 1);
  console.log(compiledContract);
  const bytecode = compiledContract.contracts[contractName].bytecode;
  const abi = JSON.parse(compiledContract.contracts[contractName].interface);
  const contractFactory = web3.eth.contract(abi);
  contracts[contractName] = {
    contract: contractFactory,
    abi: abi,
    bytecode: bytecode
  };
  return contracts[contractName];
}

function createContract(contractName, source, sender, callback) {
  console.log('Creating Contract', contractName);
  let contractInfo = contracts[contractName];
  if (!contractInfo) {
    contractInfo = registerContract(contractName, source, sender);
  }
  const bytecode = contractInfo.bytecode;
  const gasEstimate = web3.eth.estimateGas({data: bytecode});
  const contractFactory = contractInfo.contract;

  contractFactory.new({
    from: sender,
    data: bytecode,
    gas: gasEstimate
  }, function(err, createdContract) {
    if(err) {
      callback(err, null);
    } else {
      if (createdContract.address) {

        callback(null, createdContract.address);
      }
    }
  });
}


function getContractInstance(contractName, contractAddr) {
  const contractInfo = contracts[contractName];
  if (contractInfo) {
    return contractInfo.contract.at(contractAddr);
  }
  return null;
}


function registerEventListener(name, addr, event, callback) {
  const contractInstance = getContractInstance(name, addr);
  const eventFunc = contractInstance[event];
  eventFunc({from: 0, to: 'latest'}, function(error, result) {
    if (result) {
      callback(error, result.args);
    } else {
      callback(error, null);
    }
  });
}

module.exports = {
  web3: web3,
  getAccount: getAccount,
  registerContract: registerContract,
  createContract: createContract,
  getContractInstance: getContractInstance,
  registerEventListener: registerEventListener,
};
