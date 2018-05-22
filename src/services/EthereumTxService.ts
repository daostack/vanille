import { autoinject } from "aurelia-framework";
import * as Transaction from 'ethereumjs-tx';
import { TransactionReceipt, Hash } from './ArcService';

@autoinject
export class EthereumTxService {

  public create(data: EtherumTransactionConfig): Transaction {
    return new Transaction(data);
  }
}

export interface EtherumTransactionConfig {
  nonce: Number;
  gasPrice: Number;
  gasLimit: Number;
  to: string;
  value: string; // amount in hex, like '0x6F05B59D3B20000'
  data?: string;
  v?: string;
  r?: string;
  s?: string;
}
