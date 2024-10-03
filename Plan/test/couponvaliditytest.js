const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); 

const { expect } = chai;

chai.use(chaiHttp);

describe('Coupon Validity Check', () => {
  

  describe('POST /api/v1/plan/checkValidity', () => {
    it('should Check the Coupon Validity', async () => {
      // Mock plan data
      const RefferalData = {
        "referralLink":"LINK",
        "referralCode":"AD50284728"
    }
     
      const res = await chai
        .request(app)
        .post('/api/v1/plan/checkValidity')
        .send(RefferalData);

      // Check response status and body
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('success').to.equal(true);
      expect(res.body).to.have.property('message').to.equal('Validity check passed successfully');
      

      
    });

    it('should return an error if Invalid referral link ', async () => {
      // Mock existing plan data
      const RefferalData = {
        "referralLink":"LINK",
        "referralCode":"AD50284728"
    }

     
      const res = await chai
        .request(app)
        .post('/api/v1/plan/checkValidity')
        .send(RefferalData);

      // Check response status and body
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('success').to.equal(false);
      expect(res.body).to.have.property('error').to.equal('Invalid referral link or code');
    });
  });
});