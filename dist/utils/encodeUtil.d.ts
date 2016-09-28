import Json from './Json';
import PrimitiveType from './PrimitiveType';
import Serializable from '../Serializable';
export declare function encode(data: Serializable<any> | PrimitiveType, type: any): PrimitiveType | Json;
export declare function decode(data: Json | PrimitiveType, type: any): PrimitiveType | Serializable<any>;
