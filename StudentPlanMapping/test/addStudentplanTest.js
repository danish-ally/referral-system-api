const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Assuming your Express app is in the 'app.js' file


const { expect } = chai;
chai.use(chaiHttp);

describe('Student Plan API', () => {
  
  describe('POST /api/studentPlans', () => {
    it('should add a new student plan', (done) => {
      const studentPlanData = {
        "userInfo": {
          "id": 123,
          "apId": 456,
          "channel": {
            "brandId": 789,
            "name": "Your Channel Name"
          },
          "name": "John Doe",
          "email": "john.doe@example.com",
          "countryCode": "+1",
          "phone": "1234567890"
        },
        "planId": "658a9cc48ff2511789aa0837", // Replace with a valid Plan ObjectId
        "referralLink": "LINK",
        "referralCode": "17036709034170",
        "consumedUserCount": 0,
        "status": "Active"
      };

      chai
        .request(app)
        .post('/api/v1/studentplanmapping/addStudentPlan')
        .send(studentPlanData)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('message').to.equal('Student plan added successfully');
          expect(res.body).to.have.property('data');

          done();
        });
    });
  });
});