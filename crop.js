const buffer = require('buffer/').Buffer;
const sharp = require('sharp');
const probe = require('probe-image-size');
const fs = require('fs');
const app = require('express')();
const bodyParser = require('body-parser');
const FileType = require('file-type');
// const fileupload = require('express-fileupload');
// const pump = require('pump');

// app.use(fileupload())
app.use(bodyParser.json({
  limit: "4mb"
}));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html")
})

app.post("/", async (req, res) => {
  const imgBuffer = buffer.from(req.body.image.replace(/^data:image\/[a-z]+;base64,/, ""), "base64");
  const typeFile = await FileType.fromBuffer(imgBuffer);
  sharp(imgBuffer).extract({
      width: parseInt(req.body.width),
      height: parseInt(req.body.height),
      left: parseInt(req.body.left),
      top: parseInt(req.body.top)
    }).toFile(`${Math.floor(Math.random() * 100000)}.${typeFile.ext}`)
    .then(function (new_file_info) {
      console.log(new_file_info);
    })
    .catch(function (err) {
      console.log(err);
    });
})

app.listen(2980, (err) => {
  if (err) console.log(err)
  else console.log("listen");
})
//
// const image = fs.createReadStream("f6c660a1186403e019c1b6fc5fd63e5df9d29f9a70b33da135848cada08d906a.jpg");
//
// probe(image).then(({
//   height,
//   width
// }) => {
// sharp(image).extract({
//     width: width - 100,
//     height: height - 40,
//     left: 100,
//     top: 40
//   }).toFile("picture.png")
//   .then(function (new_file_info) {
//     console.log(new_file_info);
//   })
//   .catch(function (err) {
//     console.log(err);
//   });
// });



// console.log(getImageSize(image));