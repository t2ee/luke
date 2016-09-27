import Json from '../utils/Json';
import PrimitiveType from '../utils/PrimitiveType';

export default class Response {
    callId: string;
    response: Json | PrimitiveType;
    responseType: 'success' | 'error';
}
