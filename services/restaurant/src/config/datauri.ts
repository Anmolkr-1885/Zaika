//it is use to make buffer using datauri/parser.js to upload to claudinary 
import DataUriParser from 'datauri/parser.js';
import path from 'path';
const getBuffer = (file: any) => {
    const parser = new DataUriParser();

    
    const extName = path.extname(file.originalname).toString();

    return parser.format(extName, file.buffer);
};

export default getBuffer;