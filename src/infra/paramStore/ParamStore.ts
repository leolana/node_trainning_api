import { SSM } from 'aws-sdk';

interface ParamStore {
  getParameters(): SSM.Types.ParameterList;
}

export default ParamStore;
