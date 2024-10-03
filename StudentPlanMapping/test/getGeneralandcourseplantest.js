const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Replace with the path to your app file
const expect = chai.expect;

chai.use(chaiHttp);

describe('GET /api/your-endpoint', () => {
  it('should return active plans based on query parameters', async () => {
    const response = await chai
      .request(app)
      .get('/api/v1/studentplanmapping/getGeneralandCoursePlan')
      .query({
        courseType: 'standalone',
        lsSaId: '123',
        apId: '456',
        label: 'ExampleLabel',
        name: 'ExampleName',
        lsSaRefId: '789',
      });

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('activeGeneralPlans').that.is.an('array');
    expect(response.body).to.have.property('activeCoursePlans').that.is.an('array');
  });

  it('should handle cases with no active plans', async () => {
    const response = await chai
      .request(app)
      .get('/api/v1/studentplanmapping/getGeneralandCoursePlan')
      .query({
        courseType: 'nonexistent-type',
      });

    expect(response).to.have.status(404);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('error').that.equals('No active plans found for the specified criteria');
  });

  it('should handle internal server errors', async () => {
    // Mock your MongoDB connection or intentionally break something to simulate an internal server error
    // For example, comment out a required import or modify the query in the API function
    const response = await chai.request(app).get('/api/v1/studentplanmapping/getGeneralandCoursePlan');

    expect(response).to.have.status(500);
    expect(response.body).to.be.an('object');
    expect(response.body).to.have.property('error').that.equals('Internal server error');
  });
});