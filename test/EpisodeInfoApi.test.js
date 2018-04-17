const EpisodeInfoApi = require("../TimerTriggerJS1/EpisodeInfoApi")

const mockRequester = jest.fn()
const mockResponses = {
    authenticationSuccess: Promise.resolve({
        json: async () => Promise.resolve({
            token: "test123token"
        }),
        status: 200
    }),
    requestFail: Promise.resolve({
        json: async () => Promise.resolve({}),
        status: 500
    }),
    authenticationFail: Promise.resolve({
        json: async () => Promise.resolve({}),
        status: 200
    }),
    episodeInfo: Promise.resolve({
        data: [
            {
                data: {
                    name: "Homeland",
                    id: 247897
                }
            },
            {
                data: {
                    name: "Westworld",
                    id: 296762
                }
            },
            {
                data: {
                    name: "Fargo",
                    id: 269613
                }
            }
        ]
    })
}

let api = new EpisodeInfoApi(mockRequester)

describe('EpisodeInfoApi', () => {

    beforeEach(() => {
        api = new EpisodeInfoApi(mockRequester)
    })

	describe('#sendAuthenticate()', () => {
        mockRequester.mockReturnValueOnce(mockResponses.authenticationSuccess)

	    it('should have response status 200', async () => {
            const response = await api.sendAuthenticate()

            expect(response.status).toBe(200)
        })
    })

    describe('#authenticate()', () => {
	    it('should set api token on successful request', async () => {
            mockRequester.mockReturnValueOnce(mockResponses.authenticationSuccess)
            const response = await api.authenticate()

            expect(api.token).toEqual("test123token")
        })

	    it('should reject with error when no token is present in response', async () => {
            mockRequester.mockReturnValueOnce(mockResponses.authenticationFail)
            expect.assertions(1)

            return expect(api.authenticate()).rejects.toBeInstanceOf(Error)
        })

        it('should reject with error when request failed (status is not 200)', async () => {
            mockRequester.mockReturnValueOnce(mockResponses.requestFail)
            expect.assertions(1)

            return expect(api.authenticate()).rejects.toBeInstanceOf(Error)
	    })
    })

    describe('#getShowInfo()', () => {

    })
})
      
