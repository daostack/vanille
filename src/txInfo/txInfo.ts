import { autoinject } from "aurelia-framework";
import { Hash } from '../services/ArcService';
import { Web3Service } from '../services/Web3Service';
import { Block, Transaction } from 'web3/eth/types';
import { TransactionReceipt } from 'web3/types';

@autoinject
export class TxInfo {

  txHash: Hash;
  txReceipt: Transaction & TransactionReceipt;
  block: Block;
  timestamp: string;

  constructor(private web3Service: Web3Service) { }

  async activate(params: any): Promise<void> {
    this.txHash = params.txHash;

    this.txReceipt = await this.web3Service.getTxReceipt(this.txHash);

    this.block = await this.web3Service.getBlock(this.txReceipt.blockHash) as Block;
    this.timestamp = new Date(this.block.timestamp * 1000).toLocaleString();
  }
}
