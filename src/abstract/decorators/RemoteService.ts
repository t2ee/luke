import {
    SERVICE_NAME,
} from '../../symbols';

export default function RemoteService(name: string): ClassDecorator {
    return (target) => {
        target.prototype[SERVICE_NAME] = name;
    }
}
