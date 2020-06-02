var Service, Characteristic;
var request = require('request');
var dgram = require('dgram');

module.exports = function(homebridge){
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-http-hsb', 'HTTP-HSB', HTTP_HSB);
};

function HTTP_HSB(log, config) {
    this.log = log;
    this.name       = config.name;
    this.host       = config.host;
    this.baseUrl    = "http://" + this.host;
    this.switch     = config.switch;
    this.brightness = config.brightness;
    this.hue        = config.hue;
    this.saturation = config.saturation;
}

HTTP_HSB.prototype = {

    identify: function(callback) {
        this.log('Identify requested!');
        callback();
    },

    getServices: function() {
        var informationService = new Service.AccessoryInformation();

        informationService
        .setCharacteristic(Characteristic.Manufacturer, 'SmartHome')
        .setCharacteristic(Characteristic.Model, 'ESP')
        .setCharacteristic(Characteristic.SerialNumber, '8266');

        this.log('Create Lightbulb');
        var lightbulbService = new Service.Lightbulb(this.name);

        lightbulbService
        .getCharacteristic(Characteristic.On)
        .on('get', this.getPowerState.bind(this))
        .on('set', this.setPowerState.bind(this));

        lightbulbService
        .addCharacteristic(new Characteristic.Hue())
        .on('get', this.getHue.bind(this))
        .on('set', this.setHue.bind(this));

        lightbulbService
        .addCharacteristic(new Characteristic.Saturation())
        .on('get', this.getSaturation.bind(this))
        .on('set', this.setSaturation.bind(this));

        lightbulbService
        .addCharacteristic(new Characteristic.Brightness())
        .on('get', this.getBrightness.bind(this))
        .on('set', this.setBrightness.bind(this));

        this.log('Finished getting services')
        return [lightbulbService];
    },

    getPowerState: function(callback) {
        var url = this.baseUrl + this.switch.status;
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null, (parseInt(responseBody) > 0));
            }
        }.bind(this));
    },

    setPowerState: function(state, callback) {
        var url = this.baseUrl;
        if (state) {
            url += this.switch.on;
        } else {
            url += this.switch.off;
        }
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null);
            }
        }.bind(this));
    },

    getBrightness: function(callback) {
        var url = this.baseUrl + this.brightness.get;
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null, parseInt(responseBody));
            }
        }.bind(this));
    },

    setBrightness: function(level, callback) {
        var url = this.baseUrl + this.brightness.set;
        url = url.replace("%s", level);
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null);
            }
        }.bind(this));
    },

    getHue: function(callback) {
        var url = this.baseUrl + this.hue.get;
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null, parseInt(responseBody));
            }
        }.bind(this));
    },

    setHue: function(level, callback) {
        var url = this.baseUrl + this.hue.set;
        url = url.replace("%s", level);
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null);
            }
        }.bind(this));
    },

    getSaturation: function(callback) {
        var url = this.baseUrl + this.saturation.get;
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null, parseInt(responseBody));
            }
        }.bind(this));
    },

    setSaturation: function(level, callback) {
        var url = this.baseUrl + this.saturation.set;
        url = url.replace("%s", level);
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                callback(null);
            }
        }.bind(this));
    },

    _httpRequest: function(url, body, method, callback) {
        request({
            url: url,
            body: body,
            method: method,
            rejectUnauthorized: false,
            auth: false
        },
        function(error, response, body) {
            callback(error, response, body);
        });
    },

/*
    _getParam: function(urlParam, scale, callback) {
        var url = this.baseURLget + urlParam;
        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                var value = parseInt(responseBody);
                callback(null, Math.round(value * scale));
            }
        }.bind(this));
    },

    _setParamHTTP: function(urlParam, value, scale, callback) {
        var scaled = Math.round(value * scale);
        var url = this.baseURLset + urlParam + '&v=' + this._decToHex(scaled);

        this._httpRequest(url, '', 'GET', function(error, response, responseBody) {
            if (error) {
                callback(error);
            } else {
                if (responseBody != 'ok') {
                    this.log("Unexpected response: " + responseBody);
                }
                callback(null);
            }
        }.bind(this));
    },

    _decToHex: function(d) {
        var hex = Number(d).toString(16).toUpperCase();
        if (hex.length < 2) {
            hex = '0' + hex;
        }
        return hex;
    }
*/
};