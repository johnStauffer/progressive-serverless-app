# Example Progressive Web Application With Serverless Back End

## Serverless
Serverless service using the Serverless Framework and CloudFormation. 

**Cloud Formation**
* Infrastructure as code
* Spin up complete environments in seconds (api-gateway, db, lambdas, cognito user pools) 

**Cognito User Pool** 
* User onboarding, confirmation, PW reset
* Api Authorization with JWT Tokens 

**Lambda Functions**
* No managing servers or paying for idle time
* Scales automatically 

**DynamoDb**
* Fully Managed NoSQL Database

**Infrastucture as Code Example** 
`service/serverless.yml`
```
functions:
  users:
    handler: lambdas/userCrud.createUser
    events:
      - http:
          path: /users/create
          method: post
          cors:
            origin: "*"
            headers:
              - Content-Type
              - X-Amz-Date
              - Authorization
              - X-Api-Key
              - X-Amz-Security-Token
              - X-Amz-User-Agent
            allowCredentials: true
          authorizer:
            type: COGNITO_USER_POOLS
            authorizerId:
              Ref: ApiGatewayAuthorizer
```





