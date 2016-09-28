import Json from './Json';
import PrimitiveType from './PrimitiveType';
import Serializable from '../Serializable';
export function encode(data: Serializable<any> | PrimitiveType, type): PrimitiveType | Json {
    if ([String, Number, Boolean].indexOf(type) !== -1) {
        return data as PrimitiveType;
    } else {
        return (data as Serializable<any>).toJson();
    }
}
export function decode(data: Json | PrimitiveType, type): PrimitiveType | Serializable<any> {
    if ([String, Number, Boolean].indexOf(type) !== -1) {
        return data as PrimitiveType;
    } else {
        return (new type).fromJson(data);
    }
}
