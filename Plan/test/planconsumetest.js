const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Replace with the path to your app file
const expect = chai.expect;

chai.use(chaiHttp);

describe('POST /api/planConsumed', () => {
  it('should successfully update student data when referral link or code is found in StudentPlan', async () => {
    const response = await chai
      .request(app)
      .post('/api/v1/plan/planconsume')
      .send({
        referralLink: 'exampleReferralLink',
        referralCode: 'exampleReferralCode',
        originalPrice: 20,
        discountPrice: 10,
        // Add other required fields based on your API's expectations
      });

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('success').that.equals(true);
    expect(response.body).to.have.property('message').that.equals('Student Data updated successfully.');
  });

  it('should handle cases where referral link or code is not found in StudentPlan', async () => {
    const response = await chai
      .request(app)
      .post('/api/v1/plan/planconsume')
      .send({
        referralLink: 'nonexistentReferralLink',
        referralCode: 'nonexistentReferralCode',
        originalPrice: 20,
        discountPrice: 10,
        // Add other required fields based on your API's expectations
      });

    expect(response).to.have.status(404);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('success').that.equals(false);
    expect(response.body).to.have.property('message').that.equals('Referral link or code not found in student table.');
  });

  it('should handle internal server errors', async () => {
    // Mock your MongoDB connection or intentionally break something to simulate an internal server error
    // For example, comment out a required import or modify the query in the API function
    const response = await chai.request(app).post('/api/v1/plan/planconsume');

    expect(response).to.have.status(500);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('success').that.equals(false);
    expect(response.body).to.have.property('message').that.equals('Internal server error.');
  });

  // Add more test cases based on your specific scenarios
});