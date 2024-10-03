const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.should();
chai.use(chaiHttp);

describe('getBootcampByChannel', () => {
 
  it('should retrieve bootcamps for a channel', (done) => {
    const mockChannelId = '1';

    chai
      .request(app)
      .get('/api/v1/external/getbootcamp')
      .set('channelid', mockChannelId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.error.should.be.false;
        res.body.message.should.equal('got Bootcamp list successfully');

        done();
      });
  });

  it('should handle internal server error from the external API', (done) => {
    const mockChannelId = 'ert';

    chai
      .request(app)
      .get('/api/v1/external/getbootcamp')
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
