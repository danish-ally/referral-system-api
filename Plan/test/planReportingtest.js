const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Replace with the path to your app file
const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /api/planReporting', () => {
  it('should return plan reporting data', async () => {
    const response = await chai
      .request(app)
      .get('/api/v1/plan/planreporting');

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('totalPlansCount');
    expect(response.body).to.have.property('skillarbitragePlansCount');
    expect(response.body).to.have.property('lawsikhoPlansCount');
    expect(response.body).to.have.property('totalRegisteredCount');
    expect(response.body).to.have.property('skillarbitrageRegisteredCount');
    expect(response.body).to.have.property('lawsikhoRegisteredCount');
  });

  it('should handle internal server errors', async () => {
    // Mock your MongoDB connection or intentionally break something to simulate an internal server error
    // For example, comment out a required import or modify the query in the API function
    const response = await chai.request(app).get('/api/v1/plan/planreporting');

    expect(response).to.have.status(500);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('error').that.equals('Internal Server Error');
  });

  // Add more test cases based on your specific scenarios
});