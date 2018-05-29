import { SchemeConfigModel } from 'schemeConfiguration/schemeConfigModel';
import { Hash } from '../services/ArcService';

/**
 * Every voting machine configuration model must confirm to this.
 */
export interface VotingMachineConfigModel extends SchemeConfigModel {
  voteParametersHash?: Hash;
}
