const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });

module.exports.createUser = (event, context, callback) => {
    const registrationJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const username = claims['cognito:username'];

    console.log("event", event);
    console.log("context", context);
    console.log("username: ", username);
    console.log("claims", claims)

    const params = {
        Item: {
            "userId": {
                S: registrationJson.userId
            },
            "firstName": {
                S: registrationJson.firstName
            },
            "lastName": {
                S: registrationJson.lastName
            },
            "streetAddress": {
                S: registrationJson.streetAddress
            },
            "city": {
                S: registrationJson.city
            },
            "state": {
                S: registrationJson.state
            },
            "zip": {
                S: registrationJson.zip
            }
        },
        // TODO get this from environment variable
        TableName: "users-development"
    };

    console.log(params);

    dynamodb.putItem(params, function (err, data) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log(params);
            console.log(data);
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data),
            };
            callback(null, response);
        }
    });

};

module.exports.getUser = (event, context, callback) => {
    const eventBodyJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const username = claims['cognito:username'];
    const params = {
        // userId
        TableName: "users-development"
    };
    dynamodb.getItem(params, function(err, data) {
        if (err) {
            console.log('dynamodb error' + err);
            callback(err);
        }
        else {
            console.log(data);
            const response = {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
                    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data),
            };
            callback(null, response);
        }
    });
}