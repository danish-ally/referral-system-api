const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const { expect } = chai;

chai.should();
chai.use(chaiHttp);

describe('paymentSuccessfullyConsumed', () => {
  it('should update the lead and referral link data on successful payment', (done) => {
    const validReferralCode = 'IN75578664'; // Replace with an actual valid referral code
    const requestBody = {
      referralCode: validReferralCode,
      originalPrice: 100,
      discountPrice: 80,
    };

    chai
      .request(app)
      .post('/api/v1/payment/success')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('success').equal(true);
        res.body.should.have.property('message').equal('Lead Updated successfully.');

        // Add assertions to check the updated data in the database (assuming you have access to the database or a mock)
        // Example: You may want to fetch the updated data from the database and assert specific values

        done();
      });
  });

  it('should return an error if the referral code is not found', (done) => {
    const invalidReferralCode = 'IN75578666'; // Replace with an actual invalid referral code
    const requestBody = {
      referralCode: invalidReferralCode,
      originalPrice: 100,
      discountPrice: 80,
    };

    chai
      .request(app)
      .post('/api/v1/payment/success')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        res.body.should.have.property('success').equal(false);
        res.body.should.have.property('message').equal('Referral code not found');

        // Add assertions to check other parts of the response as needed

        done();
      });
  });

  // Add more test cases as needed for different scenarios
});
