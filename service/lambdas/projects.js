const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.createProject = (event, context, callback) => {
    const registrationJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const userId = claims['cognito:username'];

    const params = {
        Item: {
            "userId": {
                S: userId
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
        TableName: "users-dev2"
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