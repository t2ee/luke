import {
    SERVICE_METHODS,
} from '../symbols';
import 'reflect-metadata';

export default function RemoteMethod(): MethodDecorator {
    return (target, key: string) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);

        target[SERVICE_METHODS] = target[SERVICE_METHODS] || {};
        target[SERVICE_METHODS][key] = target[SERVICE_METHODS][key] || {
        };
    }
}
