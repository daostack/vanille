import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
// import { TruffleContractService } from '../../../services/TruffleContractService';
import { Web3Service } from "../../../services/Web3Service";

// let MintableToken = require('../../../data/contracts/MintableToken.json');
import { ArcService } from     "../../../services/ArcService";

@autoinject
@containerless
@customElement("tokenticker")
export class TokenTicker {

    private contAddrss: string;
    private usrAddrss: string;

    private tknSymbol:string = '';
    private balance:Number;

    constructor(
      private arcService: ArcService,
      private web3: Web3Service
      //   private truffleContractService: TruffleContractService
    ) {
      this.usrAddrss = this.arcService.defaultAccount;
      // this.contAddrss = web3.DAOstack.nativeToken;
    }

  bind () {
      this.readBalance();
      // this.tknSymbol="SRT";
      // this.balance= -0.0;
  }

  async readBalance() {

    const token = await this.arcService.getDAOStackMintableToken();
    
    this.tknSymbol = await token.symbol();

    // console.log('symbol: '+ this.tknSymbol);

    const myEvent = token.allEvents({ fromBlock: 'latest' });

    myEvent.watch(async () => {
      this.balance = Number(this.web3.fromWei(await token.balanceOf(this.usrAddrss)));
    });

    this.balance = Number(this.web3.fromWei(await token.balanceOf(this.usrAddrss)));

    // console.log('balance: '+ (await token.balanceOf(this.usrAddrss)).valueOf());
  }
}
