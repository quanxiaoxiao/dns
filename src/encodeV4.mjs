import encode from './encode.mjs';
import { RECORD_TYPE_A } from './recordTypes.mjs';

export default ({
  hostname,
  transactionId = 0,
}) => encode({
  hostname,
  transactionId,
  recordType: RECORD_TYPE_A,
});
