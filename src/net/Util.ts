import Transport from 'net/Transport';
import Encode from 'net/Encode';
export default class Util {
    static transportToString(transport: Transport): string {
        switch (transport) {
            case Transport.IPC:
                return 'ipc';
            case Transport.TCP:
                return 'tcp';
            case Transport.UDP:
                return 'udp';
            case Transport.WS:
                return 'ws';
        }
    }
    static encodeToString(encode: Encode): string {
        switch (encode) {
            case Encode.JSON:
                return 'json';
            case Encode.MSG_PACK:
                return 'msg_pack';
        }
    }
}
