const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app'); // Assuming your Express app is defined in app.js

const { expect } = chai;

chai.use(chaiHttp);

// Mock Plan model for testing

describe('PATCH /plans/:planId/status', () => {
  

  it('should update the status and return success message', async () => {

    // Make a PATCH request to update the status
    const res = await chai
      .request(app)
      .patch(`/api/v1/plan/planstatuschange/658d297eb4b407a7cf03af8a`)
      .query({ status: 'Active' });

    // Assert the response
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message').that.includes('Status value changed successfully');
    expect(res.body).to.have.property('plan');
    expect(res.body.plan).to.have.property('status').equal('Active');
  });

  it('should return a message if status is already the same', async () => {
    // Create a sample plan with status 'Inactive'
   

    // Make a PATCH request with the same status
    const res = await chai
      .request(app)
      .patch(`/api/v1/plan/planstatuschange/658d297eb4b407a7cf03af8a`)
      .query({ status: 'Inactive' });

    // Assert the response
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('message').that.includes('Status value is already set to Inactive');
    expect(res.body).to.have.property('plan');
    expect(res.body.plan).to.have.property('status').equal('Inactive');
  });

  it('should return an error if the plan is not found', async () => {
    // Make a PATCH request with an invalid plan ID
    const res = await chai
      .request(app)
      .patch(`/api/v1/plan/planstatuschange/658d297eb4b407a7cf03af8a`)
      .query({ status: 'Active' });

    // Assert the response
    expect(res).to.have.status(404);
    expect(res.body).to.have.property('error').that.includes('Plan not found');
  });

  it('should return an error if the status value is invalid', async () => {

    // Make a PATCH request with an invalid status value
    const res = await chai
      .request(app)
      .patch(`/api/v1/plan/planstatuschange/658d297eb4b407a7cf03af8a`)
      .query({ status: 'InvalidStatus' });

    // Assert the response
    expect(res).to.have.status(400);
    expect(res.body).to.have.property('error').that.includes('Invalid status value');
  });
});