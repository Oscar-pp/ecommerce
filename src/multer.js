// import multer, { diskStorage } from "multer";
// import { extname } from "path";

// const storage = diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public/images/");
//   },
//   filename: (req, file, cb) => {
//     const ext = extname(file.originalname);
//     const unique = Date.now();
//     cb(null, unique + ext);
//   }
// });

// export default multer({ storage });

import multer, { diskStorage } from "multer";
import { extname, join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, join(__dirname, "../public/images/"));
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    const unique = Date.now();
    cb(null, unique + ext);
  }
});

export default multer({ storage });

