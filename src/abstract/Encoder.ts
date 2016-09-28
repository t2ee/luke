import Request from './Request';
import Response from './Response';

abstract class Encoder {
    abstract encodeRequest(req: Request): Promise<Buffer>
    abstract decodeRequest(buf: Buffer): Promise<Request>
    abstract encodeReponse(res: Response): Promise<Buffer>
    abstract decodeResponse(buf: Buffer): Promise<Response>
}
export default Encoder;
