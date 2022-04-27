const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnersSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image:{
        type: String,
        require: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Partner = mongoose.model('Partner', partnersSchema);

module.exports = Partner; 