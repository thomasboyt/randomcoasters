module.exports = {
  profile: 'your-profile-name',  // load your AWS credentials from a custom profile
  region: 'us-east-1',  //the region of your Lambda function
  handler: 'index.handler',  //the name of the handler function: index because the main file is index.js
  role: 'arn:aws:iam::youraccountid:role/lambda_basic_execution',
  functionName: 'randomcoasters',  //name
  timeout: 10,  // how many seconds your function should run before it times out
  memorySize: 128,  // how much memory your function needs (shouldn't need more than this)
  publish: true,  // this creates a new version of your Lambda function every time you update it
  runtime: 'nodejs4.3',
}