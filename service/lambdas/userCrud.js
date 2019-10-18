const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({ region: 'us-east-2', apiVersion: '2012-08-10' });

module.exports.createUser = (event, context, callback) => {
    // TODO build a body mapping template
    // var registrationJson = JSON.parse(event.body);
    // const params = {
    //     Item: {
    //         "UserId": {
    //             S: registrationJson.userId
    //         },
    //         "FirstName": {
    //             S: registrationJson.firstName
    //         },
    //         "LastName": {
    //             S: registrationJson.lastName
    //         },
    //         "EmailAddress": {
    //             S: registrationJson.emailAddress
    //         },
    //         "PhoneNumber": {
    //             S: registrationJson.phoneNumber
    //         }
    //     },
    //     // TODO get this from environment variable
    //     TableName: "users-dev"
    // };

    const hardParams = {
        Item: {
            "UserId": {
                S: "1235"
            },
            "FirstName": {
                S: "john"
            },
            "LastName": {
                S: "stauffer"
            },
            "EmailAddress": {
                S: "asdfasd"
            },
            "PhoneNumber": {
                S: "asdfasdf"
            }
        },
        // TODO get this from environment variable
        TableName: "users-dev"
    };

    console.log(hardParams);

    dynamodb.putItem(hardParams, function(err, data) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log(hardParams);
            console.log(data);
            callback(null, data);
        }
    });
};