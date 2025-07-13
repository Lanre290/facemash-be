import AWS from "aws-sdk";

const r2 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "auto",
});

export async function uploadPicture(
  bucketName: string,
  fileName: string,
  buffer: Buffer,
  mimeType: string
) {
  await r2
    .putObject({
      Bucket: "facemash",
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      ACL: "public-read", // Optional: use with Cloudflare Pages/Workers to avoid egress cost
    })
    .promise();

  console.log(
    `https://${process.env.RS_DOMAIN}/${fileName}`
  );
  return `https://${process.env.RS_DOMAIN}/${fileName}`;
}
