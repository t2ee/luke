import {
    NAME,
    METHOD,
} from './symbol';
import * as Debugger from 'debug';
import 'reflect-metadata';

const debug = Debugger('decorator');


export function RemoteService(name: string): ClassDecorator {
    return (target) => {
        debug(`@RemoteService('${name}')`);
        target.prototype[NAME] = name;
    }
}

export function RemoteMethod(name: string): MethodDecorator {
    return (target, key: string) => {
        const type = Reflect.getMetadata('design:returntype', target, key);
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, key);
        debug(`@RemoteMethod('${name}') on '${key}'`);
        target[METHOD] = target[METHOD] || {};
        target[METHOD][key] = target[METHOD][key] || {
            name,
            params: [],
            response: null,
        };
        target[METHOD][key].name = name;
        //target[METHOD][key].params = paramTypes;
    }
}

export function RemoteParam(name: string): ParameterDecorator {
    return (target, key: string, index: number) => {
        const type = Reflect.getMetadata('design:paramtypes', target, key)[index];
        debug(`@RemoteParam('${name}') on '${key}[${index}]:${type}'`);
        target[METHOD] = target[METHOD] || {};
        target[METHOD][key] = target[METHOD][key] || {
            name: '',
            params: [],
            response: null,
        };
        target[METHOD][key].paramBindings[index] = {
            name,
            type,
        }
    }
}

export function RemoteResponse<T>(schema: new () => T): MethodDecorator {
    return (target, key: string) => {
        debug(`@RemoteResponse(${schema}) on '${key}'`);
        target[METHOD] = target[METHOD] || {};
        target[METHOD][key] = target[METHOD][key] || {
            name: '',
            params: [],
            response: null,
        };
        target[METHOD][key].response = schema;
    }
}
