import mocha from 'mocha'
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon'
//import sqlite3 from 'sqlite3'
import {app} from './index.js'

chai.use(chaiHttp)
chai.should()
console.log("running test..")

const {describe, it} = mocha
const {stub, fake} = sinon
const {request, expect} = chai

describe('/weather', () => {
    const sampleResponse = {"coord":{"lon":-0.13,"lat":51.51},"weather":[{"id":803,"main":"Clouds","description":"облачно с прояснениями","icon":"04n"}],"base":"stations","main":{"temp":10.73,"feels_like":9.21,"temp_min":10,"temp_max":11.67,"pressure":1012,"humidity":93},"visibility":6000,"wind":{"speed":2.1,"deg":90},"clouds":{"all":75},"dt":1608668975,"sys":{"type":1,"id":1414,"country":"GB","sunrise":1608624271,"sunset":1608652437},"timezone":0,"id":2643743,"name":"Лондон","cod":200}
    //stub(app, 'getWeatherByCityName').returns(sampleResponse)

    describe('GET /weather/city', () => {
        it('Should return 200', (done) => {
            request(app)
                .get('/weather/city?cityName=Moscow')
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json
                    expect(res.body).to.not.be.empty

                    done()
                })
        })

        it('Should return 404 (empty cityName)', (done) => {
            request(app)
                .get('/weather/city?cityName=')
                .end((err, res) => {
                    expect(res).to.have.status(404)
                    done()
                })
        })
    })

    describe('GET /weather/coordinates', () => {
        it('Should return 200', (done) => {
            request(app)
                .get('/weather/coordinates?lat=-0.13&long=51.51')
                .end((err, res) => {
                    expect(res).to.have.status(200)
                    expect(res).to.be.json
                    expect(res.body).to.not.be.empty

                    done()
                })
        })

        it('Should return 400 (empty long)', (done) => {
            request(app)
                .get('/weather/coordinates?lat=-0.13&long=')
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
                })
        })

        it('Should return 400 (empty lat)', (done) => {
            request(app)
                .get('/weather/coordinates?lat=&long=51.51')
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
                })
        })

        it('Should return 400 (empty lat & long)', (done) => {
            request(app)
                .get('/weather/coordinates?lat=&long=')
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
                })
        })
    })
})





