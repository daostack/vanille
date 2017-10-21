import { autoinject } from "aurelia-framework";
import { Web3Service } from "../services/Web3Service";
import { ArcService } from "../services/ArcService";
import { OrganizationService, Organization } from "../services/OrganizationService";
import "./list.scss";

@autoinject
export class OrganizationsList {

  list: HTMLElement;

    constructor(
        private web3: Web3Service
        , private arcService: ArcService
        , private organizationService: OrganizationService
        
    ) {
    }

    organizationArray: Array<any> = [];

    async activate() {
        
        let orgRegister = await  this.arcService.getContract("OrganizationRegister");
        let genesisScheme = await this.arcService.getContract("GenesisScheme");
        
        const myEvent = genesisScheme.NewOrg({}, { fromBlock: 0 });

        return new Promise((resolve,reject) => {
        myEvent.get(async (err, eventsArray) => {
            if (!err) {
                let newOrganizationArray = [];
                let counter = 0;
                let count = eventsArray.length;
                for (let i = 0; i < eventsArray.length; i++) {
                    let promotedAmount = 0;
                    let avatarAddress =  eventsArray[i].args._avatar;
                    let organization = await this.organizationService.organizationAt(avatarAddress);
                    let avatarName =  await this.organizationService.organizationName(organization);

                    // var org = await this.arcService.organizationAt(avatarAddress);

                    /**
                     * note that orderList.call is asynchronous, and that
                     * the results may not come back in the order invoked.
                     */
                   // promotedAmount = Number(this.web3.fromWei(eventsArray[i]));
                    
                    promotedAmount = i;

                    newOrganizationArray.push({
                        rank: i + 1,
                        name: avatarName,
                        members: 3,
                        tokens: 300000,
                        reputation: 30000,
                        promotedAmount: promotedAmount,
                        address: avatarAddress,
                    });
                    ++counter;

                    if (counter == count) { // then we're done
                        newOrganizationArray = newOrganizationArray.sort((a, b) => {
                            return b.promotedAmount - a.promotedAmount;
                        });

                        this.organizationArray = newOrganizationArray;

                        resolve();
                    }
                }
            }
        });
      });
    }

    // attached() {
    //   $(this.list).find('.tooltipped').tooltip({delay: 50});
    // }
}
