const mongoose = require("mongoose");
const gridFsService = require("../services/gridFsService");

async function streamImage(req, res) {
  const { id } = req.params;
  let stream;
  try {
    // Validate & get the download stream
    stream = gridFsService.getFileStream(id);
  } catch (err) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  // Optionally set content-type based on stored metadata,
  // but if you know all are JPEGs you can hardcode:
  res.set("Content-Type", "image/jpeg");

  stream.on("error", () => res.sendStatus(404));
  stream.pipe(res);
}

module.exports = { streamImage };
