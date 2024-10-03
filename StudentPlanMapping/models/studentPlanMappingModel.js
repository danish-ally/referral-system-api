const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentPlanSchema = new mongoose.Schema(
  {
    userInfo: {
      id: {
        type: Number,
        required: true,
      },
      apId: {
        type: Number,
        required: true,
      },
      channel: {
        brandId: {
          type: Number,
        },

        name: {
          type: String,
        },
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      countryCode: {
        type: String,
      },
      phone: {
        type: String,
      },
      consolidatedPhoneNo:{
        type: String
      }
    },
    planId: {
      type: Schema.ObjectId,
      ref: "Plan",
      required: true,
    },
    referralLink: {
      type: String,
      ref: "ReferralLink",
      required: true,
    },
    referralCode: {
      type: String,
      ref: "ReferralLink",
      required: true,
    },
    consumedUserCount: { type: Number },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Inactive",
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate and store the consolidatedPhoneNo
studentPlanSchema.pre("save", function (next) {
  const countryCode = this.userInfo.countryCode || "";
  const phone = this.userInfo.phone || "";
  
  // Summing countryCode and phone and storing in consolidatedPhoneNo
  this.userInfo.consolidatedPhoneNo = countryCode + phone;

  next();
});

const studentPlan = mongoose.model("StudentPlan", studentPlanSchema);

module.exports = studentPlan;
