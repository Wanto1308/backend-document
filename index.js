import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import FileUpload from 'express-fileupload';
import db from './config/Database.js';
import Users from './models/UserModel.js';
import DataDocument from './models/DataDocumentModel.js';
import router from './routes/index.js';

dotenv.config();
const app = express();

const connectToDatabase = async () => {
  try {
    await db.authenticate();
    console.log('Database Connected...');
    await Users.sync();
    await DataDocument.sync();
  } catch (error) {
    console.error(error);
  }
};

connectToDatabase();

app.use(cors({ origin: '*' }));
app.use(cookieParser());
app.use(express.json());
app.use(FileUpload());
app.use(express.static('public'));
app.use(router);

app.get('/', (req, res) => res.send('Welcome to Upload Document'));
app.listen(process.env.PORT || 3000, () => console.log('Server running at port 3000'));
