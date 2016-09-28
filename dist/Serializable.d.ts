import Json from './utils/Json';
declare abstract class Serializable<T> {
    abstract fromJson(json: Json): T;
    abstract toJson(): Json;
}
export default Serializable;
