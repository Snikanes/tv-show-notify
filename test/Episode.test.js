const expect = require("chai").expect;

const moment = require("moment");
const Episode = require("../src/Episode.js");

const episodeJson = {
	absoluteNumber: 17,
	airedEpisodeNumber: 7,
	airedSeason: 2,
	airedSeasonID: 669028,
	dvdEpisodeNumber: 7,
	dvdSeason: 2,
	episodeName: 'The Seventh Man',
	firstAired: '2017-03-08',
	id: 5739004,
	language: [],
	lastUpdated: 1491249940,
	overview: 'Preparations for the Earth/Mars peace conference tighten the tension on Erringwright.'
};

const showName = "The Expanse"
const showId = 1234

describe('Episode', () => {

	describe('#constructor()', () => {
		it('should construct episode object from values', () => {
	     	let expected = new Episode(5739004, showId, showName,  2, 7, moment('2017-03-08', "YYYY-MM-DD"))
			expect(expected.id).to.equal(5739004)
			expect(expected.showId).to.equal(showId)
			expect(expected.showName).to.equal(showName)
	     	expect(expected.season).to.equal(2)
	     	expect(expected.episodeNumber).to.equal(7)
	     	expect(expected.dateAired).to.deep.equal(moment('2017-03-08', "YYYY-MM-DD"))
		});
	});

	describe('#fromJson()', () => {
	    it('should construct episode object from json', () => {
	     	let expected = new Episode(5739004, showId, showName, 2, 7, moment('2017-03-08', "YYYY-MM-DD"))
	     	let result = Episode.fromJson(episodeJson, showId, showName)
	     	expect(result).to.deep.equal(expected)
	    })
  	})

  	describe('#didAirToday()', () => {
		it("should return true when the instance's dateAired field is the same day as today", () => {
			const episode = new Episode(5739004, showId, showName, 2, 7, moment())
			expect(episode.didAirToday()).to.be.true
	   	})

	    it("should return false when the instance's dateAired field is in the future", () => {
	     	const episode = new Episode(5739004, showId, showName, 2, 7, moment('2022-03-08', "YYYY-MM-DD"))
	     	expect(episode.didAirToday()).to.be.false
	    })

	    it("should return false when the instance's dateAired field is invalid", () => {
	     	const episode = new Episode(5739004, showId, showName, 2, 7, moment([2015, 25, 35]).format())
	     	expect(episode.didAirToday()).to.be.false
	    })
    })

    describe('#getAiredString()', () => {
        it("should return the correct display string for instance", () => {
            const episode = new Episode(5739004, showId, showName, 2, 7, moment([2015, 25, 35]).format())
            const displayString = "The Expanse airing today!"
            console.log(episode.getAiredString())

            expect(displayString).to.equal(episode.getAiredString())
        })
    })

})
