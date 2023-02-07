Lets start by introducing the white board:
[Lambda Whiteboard](https://www.figma.com/file/JJdOci5n2cVJTGOVsPCSG5/Untitled?node-id=1%3A228&t=n2ra6PyVpL1KEmKm-1)

![whiteboard](https://ibb.co/bvH9CFC)

The first issues I had were with permissions. It turns out that, on very basic principal, you have to create reciprocal IAM policies on each service pointing to the other:

Policy for Lambda:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::apokoala-imgaes/*"
            ]
        }
    ]
}
```

Policy for S3:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListObjectsInBucket",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::apokoala-imgaes"
        },
        {
            "Sid": "Allowobjectactions",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::apokoala-imgaes/*"
        }
    ]
}
```

Which wasnt helped by the fact that I spelled 'images' incorrectly. Further issues I ran into were you couldnt create a const because it doesnt support "requires", only import. Or if it does, i wasnt able to get it to work.

My lambda function does essentially this:

First we retrieve the object (our summary.json) from the s3 bucket

```
import {S3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';

export const handler = async (event) => {
  const s3Client = new S3Client({region: "us-east-1"})
    .getObject({
      Bucket: "apokoala-imgaes",
      Key: "summary.json",
    });

```
Now we parse it into its own array, we will use this later to handle new data, updates, and comparisons:

```
  // Parse the JSON data
  let images = [];
  try {
    images = await JSON.parse(s3Client.Body.toString());
  } catch (err) {
    console.error(err, "at images");
    images = "[]";
  }
```
Like so:
we create the new object. It will run through a for loop looking for existing images with its name, if it finds it it will overwrite it with the object we just created, if it doesnt; it will push the image to the array.

```
 // Add or update the image metadata
  const newImage = {
    name: "image1",
    size: 100,
    type: "JPEG",
  };

  let updated = false;
  for (let i = 0; i < images.length; i++) {
    if (images[i].name === newImage.name) {
      images[i] = newImage;
      updated = true;
      break;
    }
  }
  if (!updated) {
    images.push(newImage);
  }
```
Then we upload the object back to the s3 bucket:
```
  // Upload the images.json file back to the S3 bucket
  await s3Client
    .putObject({
      Bucket: "apokoala-imgaes",
      Key: "summary.json",
      Body: JSON.stringify(images),
      ContentType: "application/json"
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Metadata has been updated" }),
  };
};
```

Here is a link to my images.json file

