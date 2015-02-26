var Lab = require('lab');
var RiakPBC = require('../');
var async = require('async');
var net = require('net');

var lab = exports.lab = Lab.script();
var after = lab.after;
var before = lab.before;
var describe = lab.experiment;
var expect = Lab.expect;
var it = lab.test;

describe('Client', function () {

    describe('(callbacks)', function () {

        it('returns an error when unable to connect', function (done) {

            var client = RiakPBC.createClient({ port: 4312, connectTimeout: 10 });
            client.ping(function (err) {

                expect(err).to.exist;
                done();
            });
        });

        it('returns an error when request times out', function (done) {
            var server = net.createServer();
            server.listen(4312);
            server.on('connection', function (socket) {
                setTimeout(socket.end.bind(socket), 100);
            });

            var client = RiakPBC.createClient({ port: 4312, connectTimeout: 10 });
            async.parallel([
                function (next) {
                    client.get({
                        timeout: 50
                    }, function (err) {
                        expect(err.message).to.equal('Request timeout');
                        next();
                    });
                },
                function (next) {
                    client.ping(function (err) {
                        expect(err.message).to.equal('Request timeout');
                        next();
                    });
                }
            ], function () {
                server.close();
                done();
            });
        });
    });

    describe('(streams)', function () {

        it('returns an error when unable to connect', function (done) {

            var client = RiakPBC.createClient({ port: 4312, connectTimeout: 10 });
            client.ping().on('error', function (err) {

                expect(err).to.exist;
                done();
            });
        });
    });

    describe('(general)', function () {

        it('destroys the client pool when asked', function (done) {

            var client = RiakPBC.createClient({ minConnections: 5 });

            expect(client.pool.getPoolSize()).to.equal(5);
            client.end(function () {

                expect(client.pool.getPoolSize()).to.equal(0);
                done();
            });
        });

        it('can specify a list of nodes', function (done) {

            var nodes = [{ host: '127.0.0.1', port: 8087 }];
            var client = RiakPBC.createClient({ nodes: nodes });

            client.ping(function (err) {

                expect(err).to.not.exist;
                done();
            });
        });
    });
});
