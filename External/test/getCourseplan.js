const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');

chai.should();
chai.use(chaiHttp);

describe('getCoursePlan', () => {

  it('should retrieve course plan with valid course ID and authorization token', (done) => {
    const mockCourseId = '2';
    const mockChannelId = '1';
    const mockToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FkbWluLmxhd3Npa2hvLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLWdhdGV3YXktZGV2ZWxvcG1lbnQubGF3c2lraG8uaW4iLCJleHAiOjE3MDA3MjMxMTcsImlhdCI6MTcwMDYzNjcxNywibmJmIjoxNzAwNjM2NzE3LCJicmFuZF9pZCI6MSwidXNlckluZm8iOnsidXNlcl9pZCI6IjEiLCJuYW1lIjoiQWRtaW4iLCJlbWFpbCI6IndlYjFAaXBsZWFkZXJzLmluIiwicGhvbmUiOiI4OTAyMTI0MzE3Iiwicm9sZSI6Im1hbmFnZXIifX0.BdzEe_oV4a1anzAlJcxqf12q5-dSUbFdfwWNy3BwToYtbWGkX9QEQa3eD-NOQo-w1CxVz6i8lbS5zb1ZBT1iWyojCgr2fGrezwaRZQ3g1kVqb3w3qG88FryxkHutfVktsznwFoAMFIrqGzpk--nQBSUceFFs0HmH63wevoqZfJwm-PuzMQFM1fhcMT9emMZ4X5CyzzMwW-tcy9wKUwrxbrO--nz_TGVgYyrHJX9tevSPcV_Gi6cV_yM19VKAp1HBGNDVS9KaZ9djlQlM8LmT6AAO0nE0XMQxq9lXwiAydRRkqrwk5QquWKggPVoNq8y_67dr1vyPQnqWGstZLW8zRHsc3vVaSP0T1xrhXYw0yGn2ydtNpweFAF-jX9ItBA3ltcwfo8pqUZKT2dB5FLyoZ_JXTHE1SJJ0UxZFOYJvZGiT35X_WK8MgfWFmvSlUtCbeeEC51VR4iHsI7-Cbq1nP7RnDbeh8GQ--MjZ1u8Q-ijIQ_lGgzlpA7pkzTfpr8JKoVcdWAQWL5NJ4oD-h8SHGMUDgI4GO2PY3Qb6cJ_dnAKcuw6FhJ8HCMtNHKAZrg_8zpVtur6FkIQzAsTr_SzLnHYes0RlqMScB4laEYTjbqPpkJAiwvdSuIzJX3X6jayPEp05GBVoKomZU4frWL0MQ4CshKpEIf1eqaA3Ei1YBec';

    chai
      .request(app)
      .get(`/api/v1/external/getCoursePlan/${mockCourseId}`)
      .set('channelid', mockChannelId)
      .set('authorization', mockToken)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.error.should.be.false;
        res.body.message.should.equal('got Course list successfully');

        done();
      });
  });

  it('should handle internal server error from the external API', (done) => {
    const mockCourseId = '2';
    const mockChannelId = '1';
    const mockToken = 'mockInvalidToken';

    chai
      .request(app)
      .get(`/api/v1/external/getCoursePlan/${mockCourseId}`)
      .set('channelid', mockChannelId)
      .set('authorization', mockToken)
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.an('object');
        res.body.error.should.be.true;
        res.body.message.should.equal('Internal server error');

        done();
      });
  });
});
