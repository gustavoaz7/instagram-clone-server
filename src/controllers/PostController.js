const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');

module.exports = {
  async index(req, res) {
    const posts = await Post.find().sort('-createdAt');

    return res.json(posts);
  },
  async store(req, res) {
    const { author, place, description, hashtags } = req.body;
    const { filename: image, path: filePath, destination } = req.file;
    const [name, etx] = image.split('.');
    const fileName = `${name}.jpg`;

    await sharp(filePath)
      .resize(500)
      .jpeg({ quality: 80 })
      .toFile(path.resolve(destination, 'resized', fileName));

    fs.unlinkSync(filePath);

    const post = await Post.create({
      author,
      place,
      description,
      hashtags,
      image: fileName,
    });

    req.io.emit('post', post);

    return res.json(post);
  },
};
