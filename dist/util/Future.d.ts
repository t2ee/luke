export default class Future<T> extends Promise<T> {
    private type;
    constructor(type: new () => T, handler: (resolve, reject) => void);
    getType(): new () => T;
}
