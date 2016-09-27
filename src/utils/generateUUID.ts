import * as OS from 'os';

function getMac() {
    const interfaces = OS.networkInterfaces();
    for (const name in interfaces) {
        const net = interfaces[name];
        for (const i of net) {
            if (i.mac.length === 17 &&
                i.mac !== '00:00:00:00:00:00') {
                return i.mac.split(':').join('');
            }
        }
    }
}
const pad = (str, length) => {
    return '0'.repeat(length - str.length) + str;
}
function getSeg() {
    let ret = '';
    for (let i = 0; i < 3; i++) {
        ret += Math.floor(Math.random() * 16).toString(16);
    }
    return ret;
}

export default function generateUUID() { // 32
    const seg0 = Date.now().toString(16);  // epoch 11
    const seg1 = getMac(); // mac 12
    const seg2 = pad(process.pid.toString(16), 6)  // process id 6
    let seg3 = getSeg();
    return seg0 + seg1 + seg2 + seg3;
}
