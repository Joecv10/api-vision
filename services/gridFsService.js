// services/gridFsService.js
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

// Inicializar GridFS Bucket una vez que la conexión esté abierta
mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "images",
  });
});

/**
 * Almacena un buffer como archivo en GridFS.
 * @param {Buffer} buffer - Los datos del archivo.
 * @param {string} filename - Nombre del archivo.
 * @param {string} contentType - Tipo MIME del archivo.
 * @returns {Promise<ObjectId>} - El ObjectId del archivo guardado.
 */
async function storeFile(buffer, filename, contentType) {
  if (!bucket) throw new Error("GridFSBucket no inicializado");

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
    });

    uploadStream.end(buffer);

    uploadStream.on("error", (err) => reject(err));
    uploadStream.on("finish", () => resolve(uploadStream.id));
  });
}

module.exports = { storeFile };
