import { autoinject, customElement, bindable, bindingMode, containerless } from "aurelia-framework";
import { Web3Service } from "../../../services/Web3Service";
import { EthereumTxService } from '../../../services/EthereumTxService';

@autoinject
@customElement("faucetbutton")
@containerless
export class FaucetButton {

    @bindable({ defaultBindingMode: bindingMode.oneTime })
    fillFaucet: boolean = false;

    private usrAddrss: string;
    private ethGot: number = 0;
    private privateKey: Buffer = Buffer.from('e331b6d69882b4cb4ea581d81e0b604039a3de5967688d3dcffdd22a0c0fd109', 'hex');
    private faucetAddrss: string = '0x0C7d5acCF24B1747D5A84780346337BBceD06288';
    private getEthSuccessMessage: string = null;
    private getEthErrorMessage: string = null;
    private ethBalance: number = null;

    constructor(
            private web3: Web3Service,
            private ethereumTxService: EthereumTxService
        ) {
            this.usrAddrss = web3.defaultAccount;
        }

    async sendToFaucet() {
        const web3 = this.web3;
        const faucetAddrss = this.faucetAddrss
        const defAddrss = web3.defaultAccount;
        const amountInWei = web3.toWei(0.1, 'ether');
        this.getEthErrorMessage = null;
        this.getEthSuccessMessage = 'Working...';
        web3.eth.sendTransaction({ to: faucetAddrss, from: defAddrss, value: amountInWei }, async () => {
          try {
            this.ethBalance = (await this.web3.getBalance(this.usrAddrss));
            this.getEthSuccessMessage = '0.1 ETH sent successfully';
          } catch(ex) {
            this.getEthErrorMessage = ex;
          }
        })
    }

    getEth() {
        const web3 = this.web3;
        const amount = '0x6F05B59D3B20000' // 0.5 Ether in hex
        this.getEthErrorMessage = null;
        this.getEthSuccessMessage = 'Working...';
        web3.eth.getTransactionCount(this.faucetAddrss, (err, txCnt) => {
        if (err) {
            this.getEthSuccessMessage = null;
            this.getEthErrorMessage = err;
            return;
        }
        web3.eth.getGasPrice((err, gasPrice) => {
            if (err) {
                this.getEthSuccessMessage = null;
                this.getEthErrorMessage = err;
                return;
            }
            const rawTx = {
                nonce: txCnt,
                gasPrice: 100000000000, // Number(gasPrice),
                gasLimit: 50000,
                to: this.usrAddrss,
                value: amount
            }
            const tx = this.ethereumTxService.create(rawTx);
            tx.sign(this.privateKey);
            const serializedTx = tx.serialize();
            const tx4sending = '0x' + serializedTx.toString('hex');
            web3.eth.sendRawTransaction(tx4sending, { from: this.faucetAddrss }, (err, hash) => {
            if (err) {
                this.getEthSuccessMessage = null;
                this.getEthErrorMessage = err;
                return;
            } else {
                this.getEthSuccessMessage = '0.5 ETH sent successfully';
            }
            })
        })
        })
    }
}
