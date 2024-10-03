const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Import your Express app


chai.use(chaiHttp);
const expect = chai.expect;

// Assuming you have a function to obtain a valid token for testing


describe('updatePlan API', () => {
  let authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FkbWluLmxhd3Npa2hvLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLWdhdGV3YXktZGV2ZWxvcG1lbnQubGF3c2lraG8uaW4iLCJleHAiOjE3MDUxMjA3NzYsImlhdCI6MTcwNTAzNDM3NiwibmJmIjoxNzA1MDM0Mzc2LCJicmFuZF9pZCI6MSwidXNlckluZm8iOnsidXNlcl9pZCI6IjMwIiwibmFtZSI6IkRpcGFuamFuIEdob3NoIiwiZW1haWwiOiJkaXBhbmphbkBsYXdzaWtoby5pbiIsInBob25lIjoiOTQ3NjIyOTE5MyIsInJvbGUiOiJhZG1pbiJ9fQ.aGwvvKh3eUfB_SUvvlkkiI6NrMtBBPJ-C1iU7BUd5hrq44hAho8LBSc3fx_7NEh8MfmmpT4E3Y5pWegpMjcrvMxRDPV4F409Av5gfQzp40VU4CfrDH36eVQ1cAUyMkn92uNk8nAv9mXRcwjKKh-MCWi2veBvOX7mGrjDvHlwg_6WElOZHsfyv7HOdFHQek3b8jNrqB2AVK9Dop1pPNvW33SyT6u4_2JLhukUuplGfNw1idNa9PLLX2fRK-isGdE7l3yyBXN2GCwhS8ynbNlJxhqFcvAIyWaIW5x-9D_uHdFGwGei4e8hIbjCDQ9JxdYBBeHOSilBiUkiPuz7e1Y14-Dk85B9DWPv9QDOFQz60KcMh8AvoHrccdW9I8MGFj90y7ywoe_Ig2h7stxXsSakHu-otC8MBwS8wDHtQyxEiKkB72U17XGArcolec_1fiEfcjfZBfg6bmljPTTKXVhjeg-tcfTfQP9yk2161B1Kom61OOnx6FPJr5nKrW9Fc2kyKUx1K8bpd3f3Tt7OortaflIgknyXOwNYFn_QTyKDKPns0kSZXV4iF91CYjLdygpB6GPggKaDrKT5iYwUlz2uQrz1CoEApgrc4yMY12XNI1TNq-KYjMySpJqQ7IZMOYBCGI72jYU7uPuJZKWMeLp8zJsr7FPN-0xfT9DCOiKHN_g"; // Variable to store the authentication token

  

  it('should update an existing plan with authentication token', async () => {

    const updatedPlanData = {
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
    //   "courseInfo":null,
      "planName": "Testing6",
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
    };

    const res = await chai
      .request(app)
      .put(`/api/v1/plan/updateplan/659e65221ae10c5f2b92e6ff`)
      .set('Authorization', `Bearer ${authToken}`) // Set the Authorization header with the token
      .send(updatedPlanData);

    expect(res).to.have.status(200);
    // expect(res.body).to.be.an('object');
    // expect(res.body.success).to.be.true;
    // expect(res.body.message).to.equal('Plan updated successfully');
    // expect(res.body.plan).to.be.an('object');
    // Add additional assertions based on your response structure and data
  });

  it('should handle plan not found error', async () => {
    const updatedPlanData = {
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
    //   "courseInfo":null,
      "planName": "Testing6",
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
    };


    const res = await chai
      .request(app)
      .put(`/api/v1/plan/updateplan/659fd243dc6130bd84d5265a`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedPlanData);

    expect(res).to.have.status(404);
    expect(res.body.error).to.equal('Plan not found');
  });

  // Add more test cases for different scenarios...

});
