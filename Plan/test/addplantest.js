const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); 

const { expect } = chai;

chai.use(chaiHttp);

describe('Plan API', () => {
  

  describe('POST /api/v1/plan/addPlan', () => {
    it('should add a new plan', async () => {
      // Mock plan data
      const planData = {
        "channelInfo": {
          "lsSaRefId": "1",
          "name": "Lawsikho"
        },
        "courseType": "package",
        "courseInfo": [{
          "lsSaId": 120,
          "apId": 455,
          "label": "Mongodb",
          "urlSegment":"data1"
        },
        {
          "lsSaId": 121,
          "apId": 455,
          "label": "Couchdb",
          "urlSegment":"data2"
        }
        ],
        "planName": "Testing4",
        "registeredCount": 23, // Adjust the date accordingly
        "status": "Active",
        "appliedForAllStudent": "true",
        "appliedForAllInfluencer": "false",
        "appliedForAllAdmin": "false",
        "studentDiscount": {
          "discountType": "Flat",
          "userEarning": "10",
          "studentEarning": "20"
        },
        "influencerDiscount": {
          "discountType": "Percentage",
          "userEarning": "5"
        },
        "adminDiscount": {
          "discountType": "Flat",
          "userEarning": "15"
          
        },
        "planValidityRange": {
          "startDate": "2023-01-24",
          "endDate": "2023-05-24"
        },
        "userLimit": 50,
        "createdBy":"658a65f0c34d9b204ba9e634",
        "selectedInfluencer": [
          {
            "id": "659646fae4596fbbe2661825",
            "email": "bala@lawsikho.in",
            "name": "Bala 2"
          }
         
        ],
         "selectedAdmin": [
          {
           "id": "6583d54e7f7d2cff263d8ed0",
            "email": "ra@gmail.com",
            "name": "Ra"
          }
         
        ],
        "selectedStudent": [
          {
           "id": "6583d54e7f7d2cff263d8ed0",
            "email": "ra@gmail.com",
            "name": "Ra"
          }
         
        ],
        "editLog": [
          {
            "changeTime": "2024-01-10T12:00:00.000Z",
            "changeBy": {
              "refId": "123", 
              "name": "John Doe",
              "email": "john.doe@example.com",
              "phone": {
                "countryCode": "+1",
                "phoneNo": "1234567890",
                "consolidatedPhoneNo": "+11234567890"
              }
            },
            "payload": [{}] 
          }
        ]
      }
     
      const res = await chai
        .request(app)
        .post('/api/v1/plan/addPlan')
        .send(planData);

      // Check response status and body
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('success').to.equal(true);
      expect(res.body).to.have.property('message').to.equal('Plan added successfully');
      

      
    });

    it('should return an error if a plan with the same name already exists', async () => {
      // Mock existing plan data
      const existingPlanData = {
        "channelInfo": {
          "lsSaRefId": "1",
          "name": "Lawsikho"
        },
        "courseType": "package",
        "courseInfo": [{
          "lsSaId": 120,
          "apId": 455,
          "label": "Mongodb",
          "urlSegment":"data1"
        },
        {
          "lsSaId": 121,
          "apId": 455,
          "label": "Couchdb",
          "urlSegment":"data2"
        }
        ],
        "planName": "Testing4",
        "registeredCount": 23, // Adjust the date accordingly
        "status": "Active",
        "appliedForAllStudent": "true",
        "appliedForAllInfluencer": "false",
        "appliedForAllAdmin": "false",
        "studentDiscount": {
          "discountType": "Flat",
          "userEarning": "10",
          "studentEarning": "20"
        },
        "influencerDiscount": {
          "discountType": "Percentage",
          "userEarning": "5"
        },
        "adminDiscount": {
          "discountType": "Flat",
          "userEarning": "15"
          
        },
        "planValidityRange": {
          "startDate": "2023-01-24",
          "endDate": "2023-05-24"
        },
        "userLimit": 50,
        "createdBy":"658a65f0c34d9b204ba9e634",
        "selectedInfluencer": [
          {
            "id": "659646fae4596fbbe2661825",
            "email": "bala@lawsikho.in",
            "name": "Bala 2"
          }
         
        ],
         "selectedAdmin": [
          {
           "id": "6583d54e7f7d2cff263d8ed0",
            "email": "ra@gmail.com",
            "name": "Ra"
          }
         
        ],
        "selectedStudent": [
          {
           "id": "6583d54e7f7d2cff263d8ed0",
            "email": "ra@gmail.com",
            "name": "Ra"
          }
         
        ],
        "editLog": [
          {
            "changeTime": "2024-01-10T12:00:00.000Z",
            "changeBy": {
              "refId": "123", 
              "name": "John Doe",
              "email": "john.doe@example.com",
              "phone": {
                "countryCode": "+1",
                "phoneNo": "1234567890",
                "consolidatedPhoneNo": "+11234567890"
              }
            },
            "payload": [{}] 
          }
        ]
      }

     
      const res = await chai
        .request(app)
        .post('/api/v1/plan/addPlan')
        .send(existingPlanData);

      // Check response status and body
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success').to.equal(false);
      expect(res.body).to.have.property('error').to.equal('Plan with the same name already exists');
    });
  });
});