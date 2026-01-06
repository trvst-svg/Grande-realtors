import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
        destination: (req, file, cb) =>{
            cb(null, "uploads/citizenship");
        },
        filename: (req, file, cb) => {
            cb(null, email + path.extname(file.originalname));
        }
    });
const filterFile = (req, file, cb) => {
    if(filename){

    }
}