import PrimitiveType from '../utils/PrimitiveType';
import Serializable from '../Serializable';
import 'reflect-metadata';
export default function RemoteMethod<T extends Serializable<any>>(returnType?: new () => T | PrimitiveType): MethodDecorator;
