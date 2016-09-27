import Request from './Request';
import Response from './Response';
declare abstract class Provider {
    abstract getRequest(): Promise<Request>;
    abstract respondRequest(res: Response): Promise<void>;
    abstract sendRequest(req: Request): Promise<void>;
    abstract getResponse(): Promise<Response>;
}
export default Provider;
