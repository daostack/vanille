import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
// import { TruffleContractService } from '../../../services/TruffleContractService';
import { Web3Service } from "../../../services/Web3Service";

// let MintableToken = require('../../../data/contracts/MintableToken.json');
import { ArcService } from "../../../services/ArcService";

import { TokenService } from  "../../../services/TokenService";

@autoinject
@containerless
@customElement("tokenticker")
export class TokenTicker {

    private tknSymbol:string = '';
    private balance:Number;

    constructor(
      private arcService: ArcService,
      private tokenService: TokenService
    ) {
    }

  bind () {
      this.readBalance();
  }

  async readBalance() {

    const token = await this.arcService.getDAOStackMintableToken();
    
    this.tknSymbol = await this.tokenService.getTokenName(token);

    // console.log('symbol: '+ this.tknSymbol);

    const myEvent = token.allEvents({ fromBlock: 'latest' });

    myEvent.watch(async () => {
      this.balance = await this.tokenService.getUserTokenBalance(token);
    });

    this.balance = await this.tokenService.getUserTokenBalance(token);
    
    // console.log('balance: '+ (await token.balanceOf(this.usrAddrss)).valueOf());
  }
}
