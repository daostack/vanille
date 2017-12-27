import { bindable, containerless, customElement, autoinject } from 'aurelia-framework';
import { Web3Service } from "../../../services/Web3Service";

@autoinject
@containerless
@customElement("usersaddress")
export class UsersAddress {

  private usersAddress: string;
  
  constructor(private web3: Web3Service) {
    this.usersAddress = this.web3.defaultAccount;
  }
}
