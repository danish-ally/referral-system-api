const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.should();
chai.use(chaiHttp);

describe('addLead', () => {
  it('should add a new lead without referral code', (done) => {
    const requestBody = {
      leadDetails: {
        countryCode: '+1',
        phone: '1234567890',
        name:'demo1',
        email:'demo@gmail.com'
      },
      // Include other properties as needed
    };

    chai
      .request(app)
      .post('/api/v1/lead/addLead')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('error').equal(false);
        res.body.should.have.property('message').equal('Lead created successfully');
        res.body.should.have.property('result');
        // Add assertions to check the response and the saved lead
        done();
      });
  });

  it('should add a new lead with a valid referral code', (done) => {
    const validReferralCode = 'IN75578664'; // Replace with an actual valid referral code
    const requestBody = {
      referralCode: validReferralCode,
      leadDetails: {
        countryCode: '+1',
        phone: '1234567890',
        name:'demo1',
        email:'demo@gmail.com'
      },
      // Include other properties as needed
    };

    chai
      .request(app)
      .post('/api/v1/lead/addLead')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('error').equal(false);
        res.body.should.have.property('message').equal('Lead created successfully');
        res.body.should.have.property('result');
        // Add assertions to check the response and the saved lead
        done();
      });
  });

  it('should return an error if the referral code does not exist', (done) => {
    const invalidReferralCode = 'IN75578666'; // Replace with an actual invalid referral code
    const requestBody = {
      referralCode: invalidReferralCode,
      leadDetails: {
        countryCode: '+1',
        phone: '1234567890',
        name:'demo1',
        email:'demo@gmail.com'
      },
      // Include other properties as needed
    };

    chai
      .request(app)
      .post('/api/v1/lead/addLead')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.an('object');
        res.body.should.have.property('error').equal(true);
        res.body.should.have.property('message').equal('Internal Server Error');
        // Add assertions to check the error response
        done();
      });
  });

  // Add more test cases as needed for different scenarios
});
