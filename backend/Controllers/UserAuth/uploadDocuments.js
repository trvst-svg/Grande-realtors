import multer from "multer";

export default function uploadDocument(){
    const upload = multer({dest: "userDocuments/"});

}