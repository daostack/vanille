import { autoinject } from "aurelia-framework";
import { Web3Service, BigNumber } from "./Web3Service";
import { ArcService, TruffleContract } from './ArcService';

@autoinject
export class TokenService {

  constructor(
    private web3: Web3Service
    , private arcService: ArcService
  ) {}

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
      amount =  this.web3.fromWei(amount);   
    }
    return amount;
  }

    public async getDAOStackMintableToken() {
      const schemeRegistrar = await this.arcService.getContract("SchemeRegistrar");
      const mintableTokenAddress = await schemeRegistrar.nativeToken();
      return await this.arcService.getContract("MintableToken", mintableTokenAddress);
  }
}
