/// <reference types="node" />
import Encoder from '../../abstract/Encoder';
import Request from '../../abstract/Request';
import Response from '../../abstract/Response';
export default class JSONEncoder extends Encoder {
    encodeRequest(req: Request): Promise<Buffer>;
    decodeRequest(buf: Buffer): Promise<Request>;
    encodeReponse(res: Response): Promise<Buffer>;
    decodeResponse(buf: Buffer): Promise<Response>;
}
