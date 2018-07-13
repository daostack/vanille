// import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
// import { TokenService } from "../../../services/TokenService";
// import { BigNumber } from '../../../services/Web3Service';

// @autoinject
// @containerless
// @customElement("tokenticker")
// export class TokenTicker {

//   private tknSymbol: string = '';
//   private balance: string;

//   constructor(
//     private tokenService: TokenService
//   ) {
//   }

//   private events;

//   attached() {
//     this.readBalance();
//   }

//   detached() {
//     if (this.events) {
//       this.events.stopWatching();
//       this.events = null;
//     }
//   }

//   async readBalance() {

//     const token = await this.tokenService.getDAOstackNativeToken();

//     this.tknSymbol = await this.tokenService.getTokenSymbol(token);

//     this.getBalance(token);

//     this.events = token.allEvents({ fromBlock: 'latest' });

//     this.events.watch(() => {
//       this.getBalance(token);
//     });
//   }
//   async getBalance(token) {
//     try {
//       this.balance = (await this.tokenService.getUserTokenBalance(token, true)).toFixed(2);
//     } catch {
//     }
//   }
// }
