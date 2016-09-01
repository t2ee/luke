import Transport from '../net/Transport';
import Encode from '../net/Encode';
export default class Util {
    static transportToString(transport: Transport): string;
    static encodeToString(encode: Encode): string;
}
