import 'reflect-metadata';
export declare function RemoteService(name: string): ClassDecorator;
export declare function RemoteMethod(): MethodDecorator;
export declare function RemoteParam(name: string): ParameterDecorator;
export declare function RemoteResponse<T>(schema: new () => T): MethodDecorator;
