import { SchemeConfigModel } from 'schemeConfiguration/schemeConfigModel';
import { Hash } from '../services/ArcService';

/**
 * Every voting machine configuration model must conform to this.
 */
export interface VotingMachineConfigModel extends SchemeConfigModel {
  voteParametersHash?: Hash;
}
