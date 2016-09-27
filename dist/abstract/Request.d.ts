import Json from '../utils/Json';
import PrimitiveType from '../utils/PrimitiveType';
export default class Request {
    callId: string;
    methodName: string;
    serviceName: string;
    params: Array<Json | PrimitiveType>;
}
