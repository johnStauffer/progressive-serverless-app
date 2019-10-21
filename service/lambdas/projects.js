const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.createProject = (event, context, callback) => {
    const projectJson = JSON.parse(event.body);
    const claims = event.requestContext.authorizer.claims;
    const userId = claims['cognito:username'];

    const params = {
        Item: {
            "projectId": {
                S: (Math.floor(Math.random() * Math.floor(10000))) + ""
            },
            "userId": {
                S: userId
            },
            "projectType": {
                S: projectJson.projectType
            },
            "projectContactTime": {
                S: projectJson.projectContactTime
            },
            "projectContactDay": {
                S: projectJson.projectContactDay
            },
            "projectDescription": {
                S: projectJson.projectDescription
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
