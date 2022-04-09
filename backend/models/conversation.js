import mongoose  from "mongoose";

const conversation = mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    msg: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        default: 'text',
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    }
}, { timestamps: true});

export default mongoose.model('Conversation', conversation);