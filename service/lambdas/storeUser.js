const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-1', apiVersion: '2012-08-10' });

exports.handler = (event, context, callback) => {
    console.log(event);
    const params = {
        Item: {
            "UserId": {
                S: event.userId
            },
            "FirstName": {
                S: event.firstName
            },
            "LastName": {
                S: event.LastName
            },
            "Email" : {
                S: event.email
            },
            "PhoneNumber":
            {
                S: event.phoneNumber
            }
        },
        TableName: "usersTable_dev"
    };
    dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log(params);
            console.log(data);
            callback(null, data);
        };
    });
};