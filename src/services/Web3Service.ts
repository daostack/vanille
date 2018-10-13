import { autoinject } from "aurelia-framework";
import {
  providers as Web3Providers,
  Web3,
  EthApi,
  VersionApi,
  Unit,
  TransactionReceipt,
  Transaction,
  BlockWithoutTransactionData,
  BlockWithTransactionData
} from "web3";
import { BigNumber } from 'bignumber.js';
import { Hash, Address } from './ArcService';

@autoinject()
export class Web3Service {

  private _web3: Web3;

  constructor(
  ) {
  }

  public get web3(): Web3 { return this._web3; }

  public get accounts(): Array<string> { return this.web3 ? this.web3.eth.accounts : []; }

  public defaultAccount: Address;
  public networkName: string;

  public get currentProvider(): Web3Providers.HttpProvider { return this.web3 ? this.web3.currentProvider : null; }

  public isConnected: boolean = false;

  public get eth(): EthApi { return this.web3 ? this.web3.eth : null; }

  public get version(): VersionApi { return this.web3 ? this.web3.version : null; }

  public async getTxReceipt(txHash: Hash): Promise<Transaction & TransactionReceipt> {
    const receipt = await (<any>Promise).promisify(this.web3.eth.getTransactionReceipt)(txHash)
      .then((_tx) => _tx);
    const tx = await (<any>Promise).promisify(this.web3.eth.getTransaction)(txHash)
      .then((_tx) => _tx);
    return Object.assign(tx, receipt);
  }

  public getBlock(blockHash: Hash, withTransactions: boolean = false): Promise<BlockWithoutTransactionData | BlockWithTransactionData> {
    return (<any>Promise).promisify(this.web3.eth.getBlock)(blockHash, withTransactions)
      .then((_block) => _block);
  }

  public bytes32ToUtf8(bytes32: string): string {
    return this.web3.toUtf8(bytes32);
  }

  public fromWei(value: Number | String | BigNumber, unit: Unit = "ether"): BigNumber {
    return this.toBigNumber(this.web3.fromWei(<any>value, unit));
  }

  public toWei(value: Number | String | BigNumber, unit: Unit = "ether"): BigNumber {
    return this.toBigNumber(this.web3.toWei(<any>value, unit));
  }

  public toBigNumber(value: Number | String | BigNumber): BigNumber {
    return this.web3.toBigNumber(<any>value);
  }

  /**
   * 
   * @param ethAddress in Wei by default
   * @param inEth 
   */
  public getBalance(ethAddress: string, inEth: boolean = false): Promise<BigNumber> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(ethAddress, undefined, (error: Error, balance) => {
        if (error) {
          reject(error);
        }
        if (inEth) {
          balance = this.web3.fromWei(balance)
        }
        resolve(balance);
      });
    });
  }

  public initialize(web3): Promise<Web3> {

    /**
     * so won't throw exceptions and we can use methods like .isNaN().
     * See: https://mikemcl.github.io/bignumber.js/#errors
     */
    BigNumber.config({ ERRORS: false });

    let getNetworkFromID = (id: string): string => {
      switch (id) {
        case "1":
          return "Live";
        case "2":
          return "Morden";
        case "3":
          return "Ropsten";
        case "4":
          return "Rinkeby";
        case "42":
          return "Kovan";
        // the id that arc.js hardwires for ganache
        case "1512051714758":
          return "Ganache";
        default:
          return "Unknown";
      }
    };

    return new Promise<Web3>((resolve, reject) => {
      try {
        web3.version.getNetwork(async (err, chainId) => {
          if (!err) {
            try {

              // console.log(`Targetted network: ${Web3Service.Network}`)
              // let targetedNetworkId = getIdFromNetwork(Web3Service.Network);

              // console.log(`Found chainId ${chainId}, targetedNetworkId: ${targetedNetworkId}`);
              // if you're targeting ganache then it'll accept any network id.  Otherwise,
              // they have to match.
              // TODO:  Other networks besides kovan and ropsten?  Take  ID instead of name for network?
              // this._isCorrectChain = (targetedNetworkId === chainId) || (targetedNetworkId === ganacheNetworkId);
              // if (!this._isCorrectChain) {
              //   return reject(new Error(`Web3Service.initialize failed: connected to the wrong network, expected: ${Web3Service.Network}, actual: ${getNetworkFromID(chainId)}`));
              // } else {

              this.networkName = getNetworkFromID(chainId);

              const connected = await (<any>Promise).promisify(web3.net.getListening)()
                .then((isListening: boolean) => {
                  return isListening;
                })
                .catch((error: Error) => {
                  return false;
                });

              if (connected) {
                console.log(`Connected to Ethereum (${this.networkName})`);
                this._web3 = web3;
                this.isConnected = true;
                this.defaultAccount = await this.getDefaultAccount();
                return resolve(this._web3);
              } else {
                return reject(new Error(`Web3Service.initialize failed: isConnected: false`));
              }
              //}
            } catch (ex) {
              return reject(new Error(`Web3Service.initialize failed: ${ex}`));
            }
          } else {
            return reject(new Error(`Web3Service.initialize failed: isConnected: ${this.isConnected}`));
          }
        });
      } catch (ex) {
        return reject(new Error(`Web3Service.initialize failed: ${ex}`));
      }
    });
  }

  private async getDefaultAccount(): Promise<string> {

    return (<any>Promise).promisify(this.web3.eth.getAccounts)().then((accounts: Array<any>) => {
      const defaultAccount = this.web3.eth.defaultAccount = accounts[0];

      if (!defaultAccount) {
        throw new Error("accounts[0] is not set");
      }

      return defaultAccount;
    });
  }
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const SOME_ADDRESS = '0x1000000000000000000000000000000000000000';
export const NULL_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const SOME_HASH = '0x1000000000000000000000000000000000000000000000000000000000000000';
export { BigNumber } from 'bignumber.js';
