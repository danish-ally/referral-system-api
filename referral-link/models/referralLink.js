const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const STATUS = ['Active', 'Cancelled', 'Inactive']
const CHANNEL = ['1', '2', 'All']
const DISCOUNTTYPE = ['Percentage', 'Flat']
const ROLE = ['admin', 'influencer', 'student']



const userInfoSchema = new Schema({
    id: { type: String},
    apId: { type: Number, default: null },
    channelInfo: {
        type: Object,
        // required: false,
        default: null
    },
    name: { type: String },
    email: { type: String },
    countryCode: { type: String },
    phone: { type: String }
});

const userDiscountSchema = new Schema({
    discountType: { type: String, enum: DISCOUNTTYPE, required: true },
    upto:{type: Number, default: null },
    discountAmount: { type: Number, required: false },
    userEarning: { type: Number, required: true },
    studentEarning: { type: Number, required: true },
    userEarningAmount: { type: Number },
    studentEarningAmount: { type: Number}

});


const editLogSchema = new Schema({
    changeTime: { type: Date },
    changeBy: {
        refId: { type: String, default: null },
        name: { type: String, default: '' },
        email: {
            type: String,
            default: '',
            // validate: {
            //     validator: (v) => /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(v),
            //     message: 'Invalid email address'
            // },
            required: false
        },
        countryCode: { type: Number, default: null },
        phoneNo: { type: Number, default: null },
        contactedNumber: { type: String, default: null },
        otherInfo: { type: Object, default: {} }
    },
    beforeChanges: {
        type: Object
      },
      afterChanges: {
        type: Object
      },
});

const referralLinkSchema = new Schema({
    userType: {
        type: String,
        enum: ROLE,
        required: true
    },
    userInfo: { type: userInfoSchema },
    channelInfo: {
        type: Object,
        required: true
    },
    planId: { type: Schema.ObjectId, ref: 'Plan', required: true },
    planName: { type: String },

    userDiscount: { type: userDiscountSchema, required: true },
    validityRange: {
        startDate: { type: Date },
        endDate: { type: Date },
    },
    userLimit: { type: Number},
    referralCode: { type: String, required: true },
    status: {
        type: String,
        enum: STATUS,
        default: 'Active'
    },

    token: {
        type: String,
        // required: true
    },

    referralLink: {
        type: String,
        required: true
    },
    courseType: {
        type: String,
        enum: ['standalone', 'package', 'bootcamp'],
    },
    courseInfo: {
        lsSaId: {
            type: Number,
        },
        apId: {
            type: Number,

        },
        label: {
            type: String,

        }
    },
    coursePlanInfo: {
        type: Object,
        default: {}
    },
    createdBy: { type: userInfoSchema },
    editLog: [{ type: editLogSchema }],
    registeredCount: { type: Number, default: 0 },
    earningAmount: { type: Number, default: 0 },
    shortUrl:{type: String}

},

    {
        timestamps: true,
    }

);

const ReferralLink = mongoose.model("ReferralLink", referralLinkSchema);

module.exports = ReferralLink;
