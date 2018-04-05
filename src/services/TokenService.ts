import { autoinject } from "aurelia-framework";
import { Web3Service, BigNumber } from "./Web3Service";
import { ArcService, TruffleContract } from './ArcService';
import { DaoService } from "./DaoService";

@autoinject
export class TokenService {

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
    , private daoService: DaoService
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
    let userAddress = this.web3.defaultAccount;
    let amount = await token.balanceOf(userAddress);
    if (inEth) {
      amount = this.web3.fromWei(amount);
    }
    return amount;
  }

  public async getDAOstackNativeToken() {
    const daoStack = await this.daoService.GetDaostack();
    const daoTokenAddress = await daoStack.token.address;
    return await this.arcService.getContract("DAOToken", daoTokenAddress);
  }
}
