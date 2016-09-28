import {
    SERVICE_METHODS,
} from '../symbols';
import PrimitiveType from '../utils/PrimitiveType';
import Serializable from '../Serializable';
import 'reflect-metadata';

export default function RemoteMethod<T extends Serializable<any>>(returnType?: new () => T | PrimitiveType): MethodDecorator {
    return (target, key: string) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        if (type !== Promise) {
            throw new Error(`@RemoteMethod() can only decorate async functions`);
        }
        for (const paramType of paramTypes) {
            if ([Number, String, Boolean].indexOf(paramType) === -1 &&
                !(new paramType() instanceof Serializable)) {
                throw new Error(`@RemoteMethod() argument types can only be Number, String, Boolean, Serializable,  ${paramType.name} found`);
            }
        }


        target[SERVICE_METHODS] = target[SERVICE_METHODS] || {};
        target[SERVICE_METHODS][key] = target[SERVICE_METHODS][key] || {
            returnType,
            paramTypes,
        };
    }
}
