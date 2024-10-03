const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Lead = new Schema(
  {
    leadDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      countryCode: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      combinedPhone: {
        type: String,
        required: true,
      },
    },
    channelInfo: {
      lsSaRefId: {
        type: String,
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
    },
    planId: {
      type: String,
      default: null,
    },
    referralCode: {
      type: String,
      default: null,
    },
    Price: {
      original_price: {
        type: String,
        default: null,
      },
      discount_price: {
        type: String,
        default: null,
      },
    },
    courseType: {
      type: String,
      default: null,
    },
    courseInfo: {
      lsSaId: {
        type: String,
        default: null,
      },
      apId: {
        type: String,
        default: null,
      },
      label: {
        type: String,
        default: null,
      },
    },
    referral_link_id: {
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);

const refLead = mongoose.model("LeadReferral", Lead);

module.exports = refLead;
