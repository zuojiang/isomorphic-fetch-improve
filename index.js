'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var fetch = require('isomorphic-fetch');

var taskMap = new Map();

module.exports = function _fetch(url, options) {
  var _options$timeout = options.timeout,
      timeout = _options$timeout === undefined ? 0 : _options$timeout,
      _options$retryMaxCoun = options.retryMaxCount,
      retryMaxCount = _options$retryMaxCoun === undefined ? Infinity : _options$retryMaxCoun,
      _options$cancelableTa = options.cancelableTaskName,
      cancelableTaskName = _options$cancelableTa === undefined ? null : _options$cancelableTa,
      others = _objectWithoutProperties(options, ['timeout', 'retryMaxCount', 'cancelableTaskName']);

  var list = [];

  if (cancelableTaskName) {
    if (taskMap.has(cancelableTaskName)) {
      taskMap.get(cancelableTaskName)(new Error('cancel'));
    }
    if (url) {
      list.push(new Promise(function (resolve, reject) {
        taskMap.set(cancelableTaskName, reject);
      }));
    }
  }

  if (url) {
    list.push(fetch(url, others).then(function (res) {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName);
      }
      return res;
    }, function (err) {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName);
      }
      if (retryMaxCount > 0) {
        return _fetch(url, _extends({}, options, {
          retryMaxCount: Number.isFinite(retryMaxCount) ? retryMaxCount - 1 : retryMaxCount
        }));
      }
      throw err;
    }));
  }

  if (timeout > 0) {
    list.push(new Promise(function (resolve, reject) {
      setTimeout(function () {
        reject(new Error('timeout'));
      }, timeout);
    }));
  }

  return Promise.race(list);
};
