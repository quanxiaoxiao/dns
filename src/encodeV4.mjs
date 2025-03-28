import encode from './encode.mjs';
import { RECORD_TYPE_A } from './types.mjs';

export default ({
  hostname,
  transactionId = 0,
}) => encode({
  hostname,
  transactionId,
  type: RECORD_TYPE_A,
});
