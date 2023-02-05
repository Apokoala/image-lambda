const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event) => {
  // Get the object from the S3 bucket
  const response = await s3
    .getObject({
      Bucket: "your-bucket-name",
      Key: "images.json",
    })
    .promise();

  // Parse the JSON data
  let images = [];
  try {
    images = JSON.parse(response.Body.toString());
  } catch (err) {
    console.error(err);
  }

  // Add or update the image metadata
  const newImage = {
    name: "image1",
    size: 100,
    type: "JPEG",
    // ... other properties
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
  await s3
    .putObject({
      Bucket: "your-bucket-name",
      Key: "images.json",
      Body: JSON.stringify(images),
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Image metadata added or updated" }),
  };
};