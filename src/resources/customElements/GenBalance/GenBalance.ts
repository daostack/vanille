import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { TokenService } from "../../../services/TokenService";
import { BigNumber } from '../../../services/Web3Service';

@autoinject
@containerless
@customElement("genbalance")
export class GenBalance {

  private balance: string;
  private text: string;

  constructor(
    private tokenService: TokenService
  ) {
  }

  private events;

  attached() {
    this.readBalance();
  }

  detached() {
    if (this.events) {
      this.events.stopWatching();
      this.events = null;
    }
  }

  async readBalance() {

    const token = await this.tokenService.getGlobalGenToken();

    if (token) {
      this.getBalance(token);

      this.events = token.contract.allEvents({ fromBlock: 'latest' });

      this.events.watch(() => {
        this.getBalance(token);
      });
    } else {
      this.text = `N/A`;
    }
  }
  async getBalance(token) {
    try {
      this.balance = (await this.tokenService.getUserTokenBalance(token, true)).toFixed(2);
      this.text = this.balance.toString();
    } catch {
    }
  }
}
