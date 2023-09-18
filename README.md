# App url: https://d17kstkl8r5t9a.cloudfront.net/

# CI/CD in this app:
  To automatically deploy when there are changes on master branch to S3 bucket using Travis CI, you can follow these steps:
<br/><br/>
  Create a Travis CI account and add your GitHub repository.<br/>
  In your Travis CI configuration file, add the following snippet:<br/>
  ```
  deploy:
    provider: s3
    access_key_id: YOUR_ACCESS_KEY_ID
    secret_access_key: YOUR_SECRET_ACCESS_KEY
    bucket: YOUR_BUCKET_NAME
    region: YOUR_REGION
```
<br/>
  Replace YOUR_ACCESS_KEY_ID, YOUR_SECRET_ACCESS_KEY, YOUR_BUCKET_NAME and YOUR_REGION with your actual values.<br/>
  3. Save your Travis CI configuration file and commit it to your repository.<br/>
  4. Push your changes to your repository.<br/><br/>

  Travis CI will now automatically deploy your code to the S3 bucket when there are changes on the master branch.<br/><br/>

  Here are some additional resources that you may find helpful:<br/><br/>

  Travis CI documentation on deploying to S3: https://docs.travis-ci.com/user/deployment/s3/<br/>
  Amazon S3 documentation: https://docs.aws.amazon.com/AmazonS3/latest/userguide/

# To deploy FE in cmd:
  ```
  npm run build && aws s3 sync build/ s3://YOUR_BUCKET_NAME
```
  Replace YOUR_BUCKET_NAME with your actual value.

# To deploy BE in cmd:
  ```
  serverless deploy
```

# Demo app:
![Project5](https://github.com/Linhle1999/project-5/assets/42709781/581833b8-e1e0-4006-af8b-2ff11a06d564)

