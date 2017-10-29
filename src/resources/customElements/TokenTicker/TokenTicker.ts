import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { TokenService } from  "../../../services/TokenService";

@autoinject
@containerless
@customElement("tokenticker")
export class TokenTicker {

    private tknSymbol:string = '';
    private balance:Number;

    constructor(
      private tokenService: TokenService
    ) {
    }

  bind () {
      this.readBalance();
  }

  async readBalance() {

    const token = await this.tokenService.getDAOStackMintableToken();
    
    this.tknSymbol = await this.tokenService.getTokenSymbol(token);

    // console.log('symbol: '+ this.tknSymbol);

    const myEvent = token.allEvents({ fromBlock: 'latest' });

    myEvent.watch(async () => {
      this.balance = await this.tokenService.getUserTokenBalance(token);
    });

    this.balance = await this.tokenService.getUserTokenBalance(token);
    
    // console.log('balance: '+ (await token.balanceOf(this.usrAddrss)).valueOf());
  }
}
