const AWS = require('aws-sdk');
const uuid = require('uuid/v4');

const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.createProject = (event, context, callback) => {
    const projectJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const userId = claims['cognito:username'];

    const params = {
        Item: {
            "projectId": {
                N: uuid()
            },
            "userId": {
                S: userId
            },
            "projectType": {
                S: projectJson.lastName
            },
            "projectContactTime": {
                S: projectJson.streetAddress
            },
            "projectDescription": {
                S: projectJson.city
            }
        },
        // TODO get this from environment variable
        TableName: "projects-dev1"
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

module.exports.getProjects = (event, context, callback) => {
    const eventBodyJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const username = claims['cognito:username'];
    const params = {
        TableName: "projects-dev1",
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": { "S": username } }
    };

    documentClient.scan(params, function (err, data) {
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
