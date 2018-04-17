const expect = require("chai").expect;

const moment = require("moment-timezone");
const Episode = require("../TimerTriggerJS1/Episode.js");

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
const airedTime = "9:00 PM"

describe('Episode', () => {

	describe('#constructor()', () => {
		it('should construct episode object from values', () => {
			let expected = new Episode(5739004, showId, showName,  2, 7, episodeJson.firstAired, airedTime)
			expect(expected.id).to.equal(5739004)
			expect(expected.showId).to.equal(showId)
			expect(expected.showName).to.equal(showName)
			expect(expected.season).to.equal(2)
			expect(expected.episodeNumber).to.equal(7)
			expect(expected.dateTimeAired).to.deep.equal(moment.tz('2017-03-08 9:00 PM', "YYYY-MM-DD h:mm a", "America/New_York"))
		});
	});

	describe('#fromJson()', () => {
	    it('should construct episode object from json', () => {
	     	let expected = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired,  airedTime)
	     	let result = Episode.fromJson(episodeJson, showId, showName, airedTime)
	     	expect(result).to.deep.equal(expected)
	    })
  	})

  	describe('#justAired()', () => {
		const offset = 6

	    it("should return false when the instance's dateAired field is in the future", () => {
	     	const episode = new Episode(5739004, showId, showName, 2, 7, moment('2022-03-08', "YYYY-MM-DD"))
	     	expect(episode.justAired(0)).to.be.false
	    })

	    it("should return false when the instance's dateAired field is invalid", () => {
	     	const episode = new Episode(5739004, showId, showName, 2, 7, moment([2015, 25, 35]).format())
	     	expect(episode.justAired()).to.be.false
		})
		
		it("should return true when the instance's dateAired field plus delay is in the current hour", () => {
			const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const now = moment.tz("2017-03-09 3:00 AM", "YYYY-MM-DD h:mm a", "America/New_York")

			expect(episode.justAired(offset, now)).to.be.true
		})
		   
		it("should return true when the instance's dateAired field plus delay is in the current hour across timezones", () => {
			const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const now = moment.tz("2017-03-09 8:00 AM", "YYYY-MM-DD h:mm a", "Europe/London")

			expect(episode.justAired(offset, now)).to.be.true
		})
		   
		it("should return false when the instance's dateAired field plus delay is in the past and not within the current hour", () => {
			const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const now = moment.tz("2017-03-09 4:00 AM", "YYYY-MM-DD h:mm a", "America/New_York")

			expect(episode.justAired(offset, now)).to.be.false
		})
    })

    describe('#getAiredString()', () => {
        it("should return the correct display string for instance for UTV time", () => {
            const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const displayString = "The Expanse airing at 02:00!"

            expect(displayString).to.equal(episode.getAiredString("Europe/London"))
		})
		
		it("should return the correct display string for instance for another timezone", () => {
            const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const displayString = "The Expanse airing at 03:00!"

            expect(displayString).to.equal(episode.getAiredString("Europe/Oslo"))
        })
	})
	
	describe('#getAiredDateTime()', () => {
        it("should return correctly concatenated date and time", () => {
			const newTimezone = "Europe/London"
            const episode = new Episode(5739004, showId, showName, 2, 7, episodeJson.firstAired, airedTime)
			const airedDateTime = episode.getAiredDateTime(newTimezone)
			const expectedMoment = moment.tz('2017-03-09 02:00 AM', 'YYYY-MM-DD hh:mm a', newTimezone)
			
			const airedDateTimeString = airedDateTime.format('YYYY-MM-DD h:mm a')
			const expectedMomentString = expectedMoment.format('YYYY-MM-DD h:mm a')
			
			expect(airedDateTime.tz()).to.equal("Europe/London")
			expect(airedDateTimeString).to.equal(expectedMomentString)
        })
    })

})
