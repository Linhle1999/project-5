# App url: https://d17kstkl8r5t9a.cloudfront.net/

# Apply CI/CD in this app:
  To automatically deploy when there are changes on master branch to S3 bucket using Travis CI, you can follow these steps:

  Create a Travis CI account and add your GitHub repository.
  In your Travis CI configuration file, add the following snippet:
  deploy:
    provider: s3
    access_key_id: YOUR_ACCESS_KEY_ID
    secret_access_key: YOUR_SECRET_ACCESS_KEY
    bucket: YOUR_BUCKET_NAME
    region: YOUR_REGION
  Replace YOUR_ACCESS_KEY_ID, YOUR_SECRET_ACCESS_KEY, YOUR_BUCKET_NAME and YOUR_REGION with your actual values.
  3. Save your Travis CI configuration file and commit it to your repository.
  4. Push your changes to your repository.

  Travis CI will now automatically deploy your code to the S3 bucket when there are changes on the master branch.

  Here are some additional resources that you may find helpful:

  Travis CI documentation on deploying to S3: https://docs.travis-ci.com/user/deployment/s3/
  Amazon S3 documentation: https://docs.aws.amazon.com/AmazonS3/latest/userguide/
