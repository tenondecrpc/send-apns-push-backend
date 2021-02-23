require('dotenv').config();

const jwt = require('jsonwebtoken');
const http2 = require('http2');
const fs = require('fs');
    
async function sendPush(req, res) {
    /*
    Read p8 file. Assumes p8 file to be in same directory
    */
    const key = fs.readFileSync(__dirname + `/${process.env.P8_NAME}.p8`, 'utf8');

    //"iat" should not be older than 1 hr from current time or will get rejected
    const token = jwt.sign(
        {
            iss: process.env.TEAM_ID, //"team ID" of your developer account
            iat: Math.round((new Date()).getTime() / 1000) //Replace with current unix epoch time [Not in milliseconds, frustated me :D]
        },
        key,
        {
            header: {
                alg: "ES256",
                kid: process.env.P8_KEY_ID, //issuer key which is "key ID" of your p8 file
            }
        }
    )

    /* 
    Use 'https://api.push.apple.com' for production build
    */

    host = 'https://api.sandbox.push.apple.com';
    path = '/3/device/' + process.env.DEVICE_TOKEN;

    const client = http2.connect(host);

    client.on('error', (err) => console.error(err));

    body = {
        "aps": {
            "alert": {
                "title": process.env.PUSH_TITLE,
                "body": process.env.PUSH_BODY,
            },
            "sound": "default",
            // "topic": "topic",
            // "priority": 10,
            // "pushType": "alert",
            // "payload": {'messageFrom': 'Cristian'}
        }
    }

    headers = {
        ':method': 'POST',
        'apns-topic': process.env.BUNDLE_ID, //your application bundle ID
        ':scheme': 'https',
        ':path': path,
        'authorization': `bearer ${token}`
    }

    const request = client.request(headers);

    request.on('response', (headers, flags) => {
        for (const name in headers) {
            console.log(`${name}: ${headers[name]}`);
        }
    });

    request.setEncoding('utf8');
    let data = '';
    request.on('data', (chunk) => { data += chunk; });
    request.write(JSON.stringify(body));
    request.on('end', () => {
        console.log(`\n${data}`);
        client.close();
    });
    request.end();

    return res.sendStatus(200);
};

module.exports = {
    sendPush
};

