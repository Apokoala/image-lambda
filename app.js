import {S3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';

//gets the object from the s3 bucket
export const handler = async (event) => {
  const s3Client = new S3Client({region: "us-east-1"})
    .getObject({
      Bucket: "apokoala-imgaes",
      Key: "summary.json",
    });

  // Parse the JSON data
  let images = [];
  try {
    images = await JSON.parse(s3Client.Body.toString());
  } catch (err) {
    console.error(err, "at images");
    images = "[]";
  }

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
