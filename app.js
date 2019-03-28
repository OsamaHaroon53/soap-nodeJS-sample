var soap = require('soap');

var http = require('http')
var myService = {
    MyService: {
        MyPort: {
            MyFunction: function (args) {
                return {
                    name: args.name,
                    id: args.id
                };
            },

            // This is how to define an asynchronous function.
            MyAsyncFunction: function (args, callback) {
                // do some work
                console.log(args.a)
                callback({
                    id: 'Async',
                    sum: args.a.$value + args.b.$value
                });
            },
            LogIn: function (args, callback) {
                // do some work
                let userInfo = {
                    userName: 'osama@gmail.com',
                    password: '123456'
                }
                console.log(args.userName.$value, userInfo.userName != args.userName.$value)
                if (userInfo.userName != args.userName.$value || userInfo.password != args.password.$value)
                    throw {
                        Fault: {
                            Code: {
                                Value: 'soap:Sender',
                                Subcode: { value: 'rpc:BadArguments' }
                            },
                            Reason: { Text: 'Processing Error' },
                            statusCode: 400
                        }
                    };
                else
                    callback({
                        msg: "Successfully Login",
                        statusCode: 200
                    });
            },

            // This is how to receive incoming headers
            HeadersAwareFunction: function (args, cb, headers) {
                return {
                    name: headers.Token
                };
            },

            // You can also inspect the original `req`
            reallyDetailedFunction: function (args, cb, headers, req) {
                console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                return {
                    name: headers.Token
                };
            }
        }
    }
};


// server.listen(8000);
var http = require('http');
var xml = require('fs').readFileSync('myservice.wsdl', 'utf8');
var server = http.createServer((req, res) => {
    console.log(req.url);
    res.write(
        `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://localhost:8080/wsdl/MyService.wsdl">
            <soap:Body>
                <tns:msg>Bad Request</tns:msg>
                <tns:statusCode>304</tns:statusCode>
            </soap:Body>
        </soap:Envelope>`
    );
    res.end();
});
server.listen(8080, () => {
    console.log('app started at 8080')
});
soap.listen(server, '/wsdl', myService, xml).addSoapHeader(function (methodName, args, headers, req) {
    console.log('Adding headers for method', methodName);
    if (methodName === 'LogIn')
        return {
            Token: 'TokenInHeader'
        };
});