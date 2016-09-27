import Request from './Request';
import Response from './Response';

abstract class Provider {
    public abstract getRequest(): Promise<Request>;
    public abstract respondRequest(res: Response): Promise<void>;
    public abstract sendRequest(req: Request): Promise<void>;
    public abstract getResponse(): Promise<Response>;
}

export default Provider;
