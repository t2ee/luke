import Encoder from '../../abstract/Encoder';
import Request from '../../abstract/Request';
import Response from '../../abstract/Response';

export default class JSONEncoder extends Encoder {
    async encodeRequest(req: Request): Promise<Buffer> {
        const arr = [];
        arr.push(req.callId);
        arr.push(req.methodName);
        arr.push(req.serviceName);
        arr.push(req.params);
        return new Buffer(JSON.stringify(arr));
    }
    async decodeRequest(buf: Buffer): Promise<Request> {
        const req = new Request();
        const json = JSON.parse(buf.toString());
        req.callId = json[0];
        req.methodName = json[1];
        req.serviceName = json[2];
        req.params = json[3];
        return req;
    }
    async encodeReponse(res: Response): Promise<Buffer> {
        const arr = [];
        arr.push(res.callId);
        arr.push(res.responseType);
        arr.push(res.response);
        return new Buffer(JSON.stringify(arr));
    }
    async decodeResponse(buf: Buffer): Promise<Response> {
        const res = new Response();
        const json = JSON.parse(buf.toString());
        res.callId = json[0];
        res.responseType = json[1];
        res.response = json[2];
        return res;
    }
}
