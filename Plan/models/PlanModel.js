const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Define Plan Schema
const PlanSchema = new mongoose.Schema(
  {
    channelInfo: {
      type: Object,
      required: true,
    },
    courseType: {
      type: "string",
      enum: ["standalone", "package", "bootcamp"],
      default: null,
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
      },
      urlSegment: {
        type: String,
      },
    },
    planName: { type: String, required: true, unique: true },
    registeredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Deleted"],
      default: "Active",
    },
    appliedForAllStudent: {
      type: Boolean,
      default: false,
    },
    appliedForAllInfluencer: {
      type: Boolean,
      default: false,
    },
    appliedForAllAdmin: {
      type: Boolean,
      default: false,
    },
    studentDiscount: {
      discountType: {
        type: String,
        enum: ["Flat", "Percentage"],
      },
      referralUpto:{
        type: Number, 
        default: null 
      },
      upto:{
        type: Number, 
        default: null 
      },
      userEarning: {
        type: String,
      },
      studentEarning: {
        type: String,
      },
    },
    influencerDiscount: {
      discountType: {
        type: String,
        enum: ["Flat", "Percentage"],
      },
      upto:{
        type: Number, 
        default: null 
      },
      userEarning: {
        type: String,
      },
    },
    adminDiscount: {
      discountType: {
        type: String,
        enum: ["Flat", "Percentage"],
      },
      upto:{
        type: Number, 
        default: null 
      },
      userEarning: {
        type: String,
      },
    },

    planValidityRange: {
      type: "object",
      properties: {
        startDate: {
          type: Date,
          default: null,
        },
        endDate: {
          type: Date,
          default: null,
        },
      },
      default: null,
    },
    userLimit: {
      type: Number,
      default: null, // make userLimit required
    },
    createdBy: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
    },
    selectedInfluencer: [
      {
        id: {
          type: Schema.Types.Mixed,
          ref: "Influencer",
        },
        email: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    selectedAdmin: [
      {
        id: {
          type: Schema.Types.Mixed,
        },
        email: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    selectedStudent: [
      {
        id: {
          type: Schema.Types.Mixed,
        },
        email: {
          type: String,
        },
        name: {
          type: String,
        },
      },
    ],
    offerFor: {
      type: String
      // enum: ['admin', 'influencer', 'student', 'admin,influencer,student', 'admin,influencer', 'admin,student', 'influencer,student'],
    },
    editLog: [
      {
        changeTime: {
          type: Date,
        },
        changeBy: {
          refId: {
            type: Schema.Types.Mixed,
          },
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          phone: {
            countryCode: {
              type: String,
            },
            phoneNo: {
              type: String,
            },
            consolidatedPhoneNo: {
              type: String,
            },
            otherInfo: { type: Object, default: {} },
          },
        },
        beforeChanges: {
          type: Object
        },
        afterChanges: {
          type: Object
        },
      },
    ],
  },
  { timestamps: true }
);



// Create Plan model
const Plan = mongoose.model("Plan", PlanSchema);

module.exports = Plan;
