import mongoose from 'mongoose';

const DB_URI = 'mongodb://localhost:27017/chat';

mongoose.connect(DB_URI,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => {
    console.log('Connected to db ', DB_URI);
})