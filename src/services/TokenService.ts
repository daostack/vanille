import { autoinject } from "aurelia-framework";
import { Web3Service, BigNumber } from "./Web3Service";
import { ArcService, TruffleContract } from './ArcService';
import { OrganizationService } from "./OrganizationService";

@autoinject
export class TokenService {

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private organizationService: OrganizationService
  ) { }

  public async getTokenSymbol(token: TruffleContract): Promise<string> {
    return await token.symbol();
  }

  public async getTokenName(token: TruffleContract): Promise<string> {
    return await token.name();
  }

  /**
   * in Wei by default
   * @param token 
   */
  public async getUserTokenBalance(token: TruffleContract, inEth: boolean = false): Promise<BigNumber> {
    let userAddress = this.arcService.defaultAccount;
    let amount = await token.balanceOf(userAddress);
    if (inEth) {
      amount = this.web3.fromWei(amount);
    }
    return amount;
  }

  public async getDAOStackNativeToken() {
    const daoStack = await this.organizationService.GetDaostack();
    const daoTokenAddress = await daoStack.controller.nativeToken();
    return await this.arcService.getContract("DAOToken", daoTokenAddress);
  }
}
