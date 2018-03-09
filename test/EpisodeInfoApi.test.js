const expect = require("chai").expect;

const EpisodeInfoApi = require("../src/EpisodeInfoApi.js");

describe('EpisodeInfoApi', function() {
	this.timeout(5000);

	describe('#authenticate()', () => {

		it('should return status 200 and contain a token in the body', (done) => {
			let infoApi = new EpisodeInfoApi();
			infoApi.sendAuthenticate()
			.then(response => {
				expect(response.status).to.equal(200);
				return response.json();
			}).then(json => {
				expect(json.token).to.be.a('string');
				done();
			})
			.catch(err => {
				done(err);
			});
		});
	})
});
