const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.should();
chai.use(chaiHttp);

describe('getCourseByChannel', () => {
  
  it('should retrieve courses for a channel', (done) => {
    const mockChannelId = '1';

    chai
      .request(app)
      .get('/api/v1/external/getcourse')
      .set('channelid', mockChannelId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.error.should.be.false;
        res.body.message.should.equal('got Course list successfully');

        done();
      });
  });

  it('should handle internal server error from the external API', (done) => {
    const mockChannelId = 'ert';

    chai
      .request(app)
      .get('/api/v1/external/getcourse')
      .set('channelid', mockChannelId)
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.an('object');
        res.body.error.should.be.true;
        res.body.message.should.equal('Internal server error');

        done();
      });
  });
});
