const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const COURSE_TYPE = ['standalone', 'package', 'bootcamp']

const referredStudentSchema = new Schema({

    studentDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        countrycode: { type: String, required: true },
        phone: { type: String, required: true },
        consolidatedPhoneNo: { type: String, required: true }
    },
    channelInfo: {
        type: Object,
        required: true
    },
    planId: { type: Schema.ObjectId, ref: 'Plan', required: true },
    price: {
        originalPrice: { type: String, required: true },
        discountPrice: { type: String, required: true }
    },
    courseType: {
        type: String,
        enum: COURSE_TYPE,
        required: true
    },
    referralCode:{
        type: Object,
    },
    courseInfo: {
        lsSaId: { type: String, default: null },
        apId: { type: String, default: null },
        label: { type: String, default: null }
    },
    referralLinkId: { type: Schema.ObjectId,  required: true },
    earningAmount: {type: Number, default: 0}


},

    {
        timestamps: true,
    }

);

const ReferredStudent = mongoose.model("ReferredStudent", referredStudentSchema);

module.exports = ReferredStudent;
