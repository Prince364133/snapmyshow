const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CF_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CF_R2_ACCESS_KEY,
        secretAccessKey: process.env.CF_R2_SECRET_KEY,
    }
});

const uploadImageToR2 = async (fileBuffer, fileName, contentType) => {
    const params = {
        Bucket: process.env.CF_R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType
    };

    try {
        await R2.send(new PutObjectCommand(params));
        // Using public R2 domain or the provided public URL base
        return `${process.env.CF_R2_PUBLIC_URL}/${fileName}`;
    } catch (error) {
        console.error('Error uploading to R2:', error);
        throw new Error('Image upload failed');
    }
};

const deleteFromR2 = async (fileName) => {
    const params = {
        Bucket: process.env.CF_R2_BUCKET_NAME,
        Key: fileName
    };

    try {
        await R2.send(new DeleteObjectCommand(params));
    } catch (error) {
        console.error('Error deleting from R2:', error);
    }
};

module.exports = {
    uploadImageToR2,
    deleteFromR2
};
