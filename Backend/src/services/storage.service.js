const ImageKit = require("imagekit");


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports.uploadImage = async (fileBuffer, fileName) => {
    try {
        const response = await imagekit.upload({
            file: fileBuffer,       // image buffer
            fileName: fileName,     // uuid
            folder: "/Room_Rent_Image", // folder on ImageKit
        });

        return {
            url: response.url,
            fileId: response.fileId,
        };

    } catch (error) {
        console.log("Image Upload Error:", error);
        throw error;
    }
};
