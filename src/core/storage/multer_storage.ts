import multer from "multer";
import fs from "fs";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// function storageFunction(destination: string) {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadDir = "public/uploads/" + destination + "/";

//       if (!fs.existsSync("public/")) {
//         fs.mkdirSync("public/");
//       }
//       if (!fs.existsSync("public/uploads/")) {
//         fs.mkdirSync("public/uploads/");
//       }
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir);
//       }
//       req.file = file;
//       cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//       const extension = file.mimetype.split("/")[1];
//       file.originalname = file.originalname.replace(/ /g, "-");
//       file.originalname = file.originalname.replace(/_/g, "-");

//       if (file.originalname && file.originalname.length > 30) {
//         file.originalname = file.originalname.substring(0, 30);
//       }

//       file.originalname =
//         file.originalname + "-" + Date.now() + "." + extension;
//       cb(null, file.originalname);
//     },
//   });
//   return storage;
// }

export default upload;
