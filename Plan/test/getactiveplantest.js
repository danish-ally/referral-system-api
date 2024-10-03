const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Replace with the path to your Express app
const expect = chai.expect;

chai.use(chaiHttp);

describe('getActivePlans API', () => {
  it('should get active plans based on filters', (done) => {
    chai.request(app)
      .get('/api/v1/plan/getActiveplan')
      .query({ studentId: '617c8201672d0823e0d33c7d', influencerId: '617c8201672d0823e0d33c7f', adminId: '617c8201672d0823e0d33c7f' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(1);
        expect(res.body).to.have.property('message').to.equal('Got Active Plans successfully');
        expect(res.body).to.have.property('activePlans').to.be.an('array');
        // Add more assertions based on your response structure and expectations

        done();
      });
  });

  it('should handle internal server error', (done) => {
    // Mock the Plan.find to throw an error for internal server error testing
    sinon.stub(Plan, 'find').throws(new Error('Mocked Internal Server Error'));

    chai.request(app)
      .get('/api/v1/plan/getActiveplan')
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('status').to.equal(0);
        expect(res.body).to.have.property('message').to.equal('Internal Server Error');
        expect(res.body).to.have.property('error').to.be.a('string');
        // Add more assertions based on your response structure and expectations

        // Restore the stub to its original state
        Plan.find.restore();
        done();
      });
  });
});