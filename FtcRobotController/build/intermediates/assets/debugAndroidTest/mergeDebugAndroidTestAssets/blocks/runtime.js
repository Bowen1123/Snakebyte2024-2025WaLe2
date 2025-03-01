/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods included when we run a BlocksOpMode.
 * @author lizlooney@google.com (Liz Looney)
 */

// The following are defined via WebView.addJavascriptInterface in BlocksOpMode.java.
// blocksOpMode
// telemetry

// IMPORTANT!!! All identifiers in this file must be added as reserved words for the JavaScript runtime.
// This is done in the function addReservedWordsForJavaScriptRuntime in FtcBlocks_common.js.

var currentBlockLabel = '';

function callRunOpMode() {
  blocksOpMode.scriptStarting();
  try {
    // Call the runOpMode method in the generated javascript.
    runOpMode();
  } catch (e) {
    blocksOpMode.caughtException(String(e), currentBlockLabel);
  }
  blocksOpMode.scriptFinished();
}

function startBlockExecution(blockLabel) {
  currentBlockLabel = blockLabel;
  return true;
}

function endBlockExecution(value) {
  currentBlockLabel = '';
  return value;
}

function telemetryAddTextData(key, data) {
  switch (typeof data) {
    case 'string':
      telemetry.addTextData(key, data);
      break;
    case 'object':
      if (data instanceof Array) {
        telemetry.addTextData(key, String(data));
      } else if (Object.keys(data).length == 0) {
        // This is a Java object.
        telemetry.addObjectData(key, data);
      } else {
        // This is a JavaScript object.
        telemetry.addTextData(key, JSON.stringify(data));
      }
      break;
    default:
      telemetry.addTextData(key, String(data));
      break;
  }
}

function telemetrySpeak(data, languageCode, countryCode) {
  switch (typeof data) {
    case 'string':
      telemetry.speakTextData(data, languageCode, countryCode);
      break;
    case 'object':
      if (data instanceof Array) {
        telemetry.speakTextData(String(data), languageCode, countryCode);
      } else {
        telemetry.speakObjectData(data, languageCode, countryCode);
      }
      break;
    default:
      telemetry.speakTextData(String(data), languageCode, countryCode);
      break;
  }
}

function callJava(miscIdentifierForJavaScript, returnType, accessMethod, convertReturnValue,
    methodLookupString) {
  // According to
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
  // Javascript rest parameters (the ... parameter) is not available until Chrome 47.
  // The Dragonboard's WebView is based on Chrome 44, so we can't use rest parameters.
  // Get the extra parameters the old-fashioned way.
  var numNamedArgs = callJava.length;
  var extraParameters = [];
  for (var i = numNamedArgs; i < arguments.length; i++) {
    if (typeof arguments[i] == 'object') {
      extraParameters[i - numNamedArgs] = getJavaObject(arguments[i]);
    } else {
      extraParameters[i - numNamedArgs] = arguments[i];
    }
  }

  var newRest = Array.prototype.slice.call(extraParameters);
  for (var i = 0; i < newRest.length; i++) {
    if (typeof newRest[i] == 'number') {
      newRest[i] = String(newRest[i]);
    }
  }
  var newArgs = Array.prototype.slice.call(extraParameters);
  newArgs.unshift(methodLookupString, JSON.stringify(newRest));
  while (newArgs.length < 23) { // MiscAccess.callJava, callJava_boolean, and callJava_String have 23 args
    newArgs.push(null);
  }
  var result = miscIdentifierForJavaScript[accessMethod].apply(miscIdentifierForJavaScript, newArgs);
  switch (convertReturnValue) {
    case 'Number':
      result = Number(result);
      break;
  }
  return result;
}


function callHardware(miscIdentifierForJavaScript, returnType, accessMethod, convertReturnValue,
    deviceName, methodLookupString) {
  // According to
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
  // Javascript rest parameters (the ... parameter) is not available until Chrome 47.
  // The Dragonboard's WebView is based on Chrome 44, so we can't use rest parameters.
  // Get the extra parameters the old-fashioned way.
  var numNamedArgs = callHardware.length;
  var extraParameters = [];
  for (var i = numNamedArgs; i < arguments.length; i++) {
    if (typeof arguments[i] == 'object') {
      extraParameters[i - numNamedArgs] = getJavaObject(arguments[i]);
    } else {
      extraParameters[i - numNamedArgs] = arguments[i];
    }
  }

  var newRest = Array.prototype.slice.call(extraParameters);
  for (var i = 0; i < newRest.length; i++) {
    if (typeof newRest[i] == 'number') {
      newRest[i] = String(newRest[i]);
    }
  }
  var newArgs = Array.prototype.slice.call(extraParameters);
  newArgs.unshift(deviceName, methodLookupString, JSON.stringify(newRest));
  while (newArgs.length < 24) { // MiscAccess.callHardware, callHardware_boolean, and callHardware_String have 24 args
    newArgs.push(null);
  }
  var result = miscIdentifierForJavaScript[accessMethod].apply(miscIdentifierForJavaScript, newArgs);
  switch (convertReturnValue) {
    case 'Number':
      result = Number(result);
      break;
  }
  return result;
}

function listLength(miscIdentifierForJavaScript, o) {
  // If o is a javascript array or string, just return o.length.
  switch (typeof o) {
    case 'object':
      if (o instanceof Array) {
        return o.length;
      }
      break;
    case 'string':
      return o.length;
  }

  // Otherwise, pass o to the Java helper function.
  return miscIdentifierForJavaScript.listLength(o);
}

function listIsEmpty(miscIdentifierForJavaScript, o) {
  // If o is a javascript array or string, just return o.length == 0.
  switch (typeof o) {
    case 'object':
      if (o instanceof Array) {
        return o.length == 0;
      }
      break;
    case 'string':
      return o.length == 0;
  }

  // Otherwise, pass o to the Java helper function.
  return miscIdentifierForJavaScript.listIsEmpty(o);
}

function nullOrJson(s) {
  if (typeof s == 'string') {
    return JSON.parse(s);
  }
  return null;
}

function evalIfTruthy(o, code, otherwise) {
  return o ? eval(code) : otherwise;
}

var mapJavaToJavaScript = new WeakMap(); // Maps a Java object/array to a JavaScript object/list
var mapJavaScriptToJava = new WeakMap(); // Maps a JavaScript object/list to a Java object/array

function getObjectViaJson(miscIdentifierForJavaScript, oJava) {
  var oJavaScript = mapJavaToJavaScript.get(oJava);
  if (oJavaScript) {
    return oJavaScript;
  }
  var json = miscIdentifierForJavaScript.objectToJson(oJava);
  oJavaScript = JSON.parse(json);
  mapJavaToJavaScript.set(oJava, oJavaScript);
  mapJavaScriptToJava.set(oJavaScript, oJava);
  return oJavaScript;
}

function updateObjectViaJson(miscIdentifierForJavaScript, oJava) {
  // Remove the old values from the maps.
  var oJavaScript = mapJavaToJavaScript.get(oJava);
  if (oJavaScript) {
    mapJavaScriptToJava.delete(oJavaScript);
  }
  if (mapJavaToJavaScript.has(oJava)) {
    mapJavaToJavaScript.delete(oJava);
  }

  // Get the new values and put them in the maps.
  return getObjectViaJson(miscIdentifierForJavaScript, oJava);
}

function getJavaObject(oJavaScript) {
  var oJava = mapJavaScriptToJava.get(oJavaScript);
  if (oJava) {
    return oJava;
  }
  // If oJavaScript isn't in the map, it might be that oJavaScript came from a
  // MyBlocks block, which means it is really a Java Object.
  return oJavaScript;
}

function colorBlobsFilterByArea(minArea, maxArea, blobs) {
  var toRemove = [];
  for (var i = 0; i < blobs.length; i++) {
    var b = blobs[i];
    if (b.ContourArea > maxArea || b.ContourArea < minArea) {
      toRemove.push(i);
    }
  }
  for (var i = toRemove.length - 1; i >= 0; i--) {
    blobs.splice(toRemove[i], 1);
  }
}

function colorBlobsSortByArea(sortOrder, blobs) {
  blobs.sort(function(c1, c2) {
    var tmp = Math.sign(c2.ContourArea - c1.ContourArea);
    if (sortOrder == "ASCENDING") {
      tmp = -tmp;
    }
    return tmp;
  });
}

function colorBlobsFilterByDensity(minDensity, maxDensity, blobs) {
  var toRemove = [];
  for (var i = 0; i < blobs.length; i++) {
    var b = blobs[i];
    if (b.Density > maxDensity || b.Density < minDensity) {
      toRemove.push(i);
    }
  }
  for (var i = toRemove.length - 1; i >= 0; i--) {
    blobs.splice(toRemove[i], 1);
  }
}

function colorBlobsSortByDensity(sortOrder, blobs) {
  blobs.sort(function(c1, c2) {
    var tmp = Math.sign(c2.Density - c1.Density);
    if (sortOrder == "ASCENDING") {
      tmp = -tmp;
    }
    return tmp;
  });
}

function colorBlobsFilterByAspectRatio(minAspectRatio, maxAspectRatio, blobs) {
  var toRemove = [];
  for (var i = 0; i < blobs.length; i++) {
    var b = blobs[i];
    if (b.AspectRatio > maxAspectRatio || b.AspectRatio < minAspectRatio) {
      toRemove.push(i);
    }
  }
  for (var i = toRemove.length - 1; i >= 0; i--) {
    blobs.splice(toRemove[i], 1);
  }
}

function colorBlobsSortByAspectRatio(sortOrder, blobs) {
  blobs.sort(function(c1, c2) {
    var tmp = Math.sign(c2.AspectRatio - c1.AspectRatio);
    if (sortOrder == "ASCENDING") {
      tmp = -tmp;
    }
    return tmp;
  });
}

// IMPORTANT!!! All identifiers in this file must be added as reserved words for the JavaScript runtime.
// This is done in the function addReservedWordsForJavaScriptRuntime in FtcBlocks_common.js.
