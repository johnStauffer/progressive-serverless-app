const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });
const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.getWorkersForTask = (event, context, callback) => {
    const eventBodyJson = JSON.parse(event.body);
    const params = {
        TableName: "workers-dev2"
    };
    documentClient.scan(params, function(err, data) {
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
