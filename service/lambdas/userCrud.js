const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });

module.exports.createUser = (event, context, callback) => {
    var registrationJson = JSON.parse(event.body);
    var user = event.requestContext.authorizer
    console.log("requestContext: ", event.requestContext);
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
            "emailAddress": {
                S: registrationJson.emailAddress
            },
            "phoneNumber": {
                S: registrationJson.phoneNumber
            }
        },
        // TODO get this from environment variable
        TableName: "users-development"
    };

    console.log(params);

    dynamodb.putItem(params, function(err, data) {
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
                  "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                  "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
                },
                body: JSON.stringify(data),
              };
            callback(null, data);
        }
    });
};