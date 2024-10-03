const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const influencer = new Schema({

    influencerDetails: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        countryCode: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        combinedPhone: {
            type: String,
            required: true
        }
    },
    channel: [
        {
            brand_Id: {
                type: String,
                default: null
            },
            brandName: {
                type: String,
                default: null
            }
        }
    ],
    password: {
        type: String,
        required: true
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
              otherInfo: { type: Object, default: {} }
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
    status: {
        type: String,
        enum: ["Deleted", "Active", "Inactive"],
        default: "Active",
        required: true,
    },

}, { timestamps: true });

const Influencer = mongoose.model('Influencer', influencer);

module.exports = Influencer;

