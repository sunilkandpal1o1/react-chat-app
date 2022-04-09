import mongoose from 'mongoose';

const room = mongoose.Schema({
    name: String,
    isGroup: {
        type: Boolean,
        default: false,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

export default mongoose.model('Room', room);