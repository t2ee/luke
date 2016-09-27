import PrimitiveType from './PrimitiveType';

interface Json {
    [key: string]: PrimitiveType | Json;
}
export default Json;
