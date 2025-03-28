import encode from './encode.mjs';
import { RECORD_TYPE_AAAA } from './types.mjs';

export default ({
  hostname,
  identification = 0,
}) => encode({
  hostname,
  identification,
  type: RECORD_TYPE_AAAA,
});
