let startTimeMap = {};
var capturedSpeedTestClientIP = false
var capturedSpeedTestClientASN = false
var capturedSpeedTestServerLoc = false
var capturedSpeedTestServerIP = false
var popupFrequency = 60

const url_list_common = [
  "https://www.w3.org/",
  "https://medium.com/",
  "https://discord.com/",
  "https://www.who.int/",
  "https://www.shopify.com/",
  "https://www.addtoany.com/",
  "https://www.digitalocean.com/",
  "https://www.worldbank.org/en/home",
  "https://coinmarketcap.com/",
  "https://www.datadoghq.com/",
  "https://www.checkpoint.com/",
  "https://smallpdf.com/",
  "https://www.trustpilot.com/",
  "https://www.merriam-webster.com/",
];

const url_list_regions = [
  "https://www.time.com/",
  "https://www.latimes.com/",
  "https://www.pbs.org/",
  "https://www.loc.gov/",
  "https://www.caliente.mx/",
  "https://creativecommons.org/",
  "https://www.hostgator.com.br/",
  "https://www.ig.com.br/",
  "https://olhardigital.com.br/",
  "https://www.meteored.com.ar/",
  "https://nubank.com.br/",
  "https://www.placardefutebol.com.br/",
  "https://european-union.europa.eu/index_en",
  "https://www.politico.eu/",
  "https://www.tagesspiegel.de/",
  "https://www.thesun.co.uk/",
  "https://www.t-online.de/",
  "https://www.repubblica.it/",
  "https://hochi.news/",
  "https://www.hmetro.com.my/",
  "https://line.me/en/",
  "https://www.timenews.co.id/",
  "https://www.biglobe.ne.jp/",
  "https://www.thestar.com.my/",
  "https://www.unimelb.edu.au/",
  "https://www.griffith.edu.au/",
  "https://hipages.com.au/",
  "https://www.nsw.gov.au/",
  "https://www.unsw.edu.au/",
  "https://www.telstra.com.au/",
  "https://www.ietf.org/",
  "https://about.gitlab.com/",
  "https://surfshark.com/",
  "https://www.geeksforgeeks.org/",
  "https://www.warnerbros.com/",
  "https://brave.com/",
  "https://www.regjeringen.no/no/id4/",
  "https://www.skatteetaten.no/person/",
  "https://www.prisjakt.no/",
  "https://www.vinmonopolet.no/",
  "https://www.tek.no/",
  "https://www.xxl.no/"
];

var url_list = url_list_common.concat(url_list_regions)

urls_completed = []

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let testId;
chrome.runtime.onInstalled.addListener(function(details) {
  // Check if the reason is 'install' (extension is newly installed)
  if (details.reason === 'install') {
    // Code to run only once after the extension is installed
    console.log('Extension installed. Generating unique UUID');
    
    testId=generateUUID();
    console.log(`UUID is ${testId}`)
    chrome.storage.local.set({ measurementId: testId });
    chrome.runtime.sendMessage({measurementId: testId })
  }
});

chrome.webRequest.onSendHeaders.addListener(
    function (details) {
        startTimeMap[details.requestId] = {
              startTime: details.timeStamp,
              requestUrl: details.url,
            };
    },
    { urls: url_list }
);

chrome.webRequest.onBeforeRedirect.addListener(
  function (details) {
    const requestId = details.requestId;
    const startTimeData = startTimeMap[requestId];

    if (!startTimeData) {
      return;
    }

    console.log(`Redirected URL: ${startTimeData.requestUrl} to ${details.url}`);
  },
  { urls: url_list }
);

chrome.webRequest.onResponseStarted.addListener(
    function (details) {
      const requestId = details.requestId;
      const startTimeData = startTimeMap[requestId];
  
      if (!startTimeData) {
        return;
      }
  
      // Calculate Time To First Byte (TTFB)
      const respStart = details.timeStamp
      const ttfb = respStart - startTimeData.startTime;
      startTimeMap[requestId].respStartTime = respStart
      startTimeMap[requestId].ttfb = ttfb;

      },
      { urls: url_list }
)

chrome.webRequest.onCompleted.addListener(
  function (details) {
    const requestId = details.requestId;
    const startTimeData = startTimeMap[requestId];

    if (!startTimeData) {
      return;
    }
    console.log("Request Completed")
    startTimeMap[requestId].ip = details.ip;
    startTimeMap[requestId].status = "success";
    startTimeMap[requestId].statusCode = details.statusCode;
    startTimeMap[requestId].fromCache = details.fromCache;
    console.log(`URL: ${startTimeData.requestUrl}`);
    console.log(`details : ${JSON.stringify(details)}`)

    // Send message to other extension components
    chrome.runtime.sendMessage(startTimeMap[requestId]);

  },
  { urls: url_list }
);

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      var found_amz_cache_status = false
      var found_amz_pop_loc = false
      var found_cf_cache_status = false
      var found_cf_ray = false
      // Iterate through response headers
      for (const header of details.responseHeaders) {
        if (header.name.toLowerCase() === 'x-amz-cf-pop') {
          // Capture the value of the cdn header
          const customHeaderValue = header.value;
          // Log or process the captured value as needed
          console.log(`${header.name.toLowerCase()}: ${customHeaderValue}`)
          startTimeMap[details.requestId].x_amz_cf_pop = customHeaderValue
          found_amz_pop_loc = true
        }
        else if (header.name.toLowerCase() === 'cf-ray') {
          // Capture the value of the custom header
          const customHeaderValue = header.value;
          // Log or process the captured value as needed
          console.log(`${header.name.toLowerCase()}: ${customHeaderValue}`)
          startTimeMap[details.requestId].cf_ray = customHeaderValue
          found_cf_ray = true
        }
        
        if (header.name.toLowerCase() === 'x-cache') {
          // Capture the value of the cdn header
          const customHeaderValue = header.value;
          // Log or process the captured value as needed
          console.log(`${header.name.toLowerCase()}: ${customHeaderValue}`)
          if (customHeaderValue.toLowerCase().includes('cloudfront')) {
            startTimeMap[details.requestId].x_cache = customHeaderValue
            found_amz_cache_status = true
          }
        }
        else if (header.name.toLowerCase() === 'cf-cache-status') {
          // Capture the value of the cdn header
          const customHeaderValue = header.value;
          // Log or process the captured value as needed
          console.log(`${header.name.toLowerCase()}: ${customHeaderValue}`)
          startTimeMap[details.requestId].cf_cache_status = customHeaderValue
          found_cf_cache_status = true
        }

        if ((found_amz_cache_status && found_amz_pop_loc) || (found_cf_cache_status && found_cf_ray)) {
          break;
        }
      }
      if (found_amz_pop_loc) {
        if (found_cf_cache_status) {
          console.log("Error in fetching right cache status")
          startTimeMap[details.requestId].cf_cache_status = null
        }
      }
      if (found_cf_ray) {
        if (found_amz_cache_status) {
          console.log("Error in fetching right cache status")
          startTimeMap[details.requestId].x_cache = null
        }
      }
      // Return the responseHeaders property to allow the response to continue
      return { responseHeaders: details.responseHeaders };
    },
    { urls: url_list },
    ["responseHeaders"]
);

chrome.webRequest.onErrorOccurred.addListener(
  function (details) {
    console.error('Error:', details.error);
    startTimeMap[details.requestId].status = "fail";
    chrome.runtime.sendMessage(startTimeMap[details.requestId]);
  },
  { urls: url_list}
);


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // Log or use the received value
      console.log(`Message from measure_stats.js about ${JSON.stringify(request)}`);
      if (request.speedTestCompleted) {
        capturedSpeedTestClientASN = false
        capturedSpeedTestClientIP = false
        capturedSpeedTestServerIP = false
        capturedSpeedTestServerLoc = false
      }
      if (request.retrieveUUID) {
        chrome.storage.local.get(['measurementId'], function(result) {
          console.log(`Retrieved UUID from storage: ${result.measurementId}`)
          chrome.runtime.sendMessage({measurementId: result.measurementId })
          });
      }
      if (request.lastASN) {

        chrome.storage.local.set({ lastASN: request.lastASN.ASN });
        console.log(`asnLast: ${JSON.stringify(request.lastASN.ASN)}`)

        chrome.storage.local.get(['asnLastResults'], function(result) {
          var asnLastResultsUpdated = result.asnLastResults || {};
          asnLastResultsUpdated[request.lastASN.ASN] = request.lastASN.lastResults
          chrome.storage.local.set({ asnLastResults: asnLastResultsUpdated });
          console.log(`asnLastResults: ${JSON.stringify(asnLastResultsUpdated)}`)
        })

      }

      if (request.getASNDetails) {
        var allASNDetails = new Object()
        chrome.storage.local.get(['lastASN'], function(result) {
          var lastASN = result.lastASN || null;
          if (lastASN) {
            allASNDetails['lastASN'] = lastASN
            chrome.storage.local.get(['asnLastResults'], function(result) {
              var lastASNResults = result.asnLastResults || null;
              if (lastASNResults.hasOwnProperty(lastASN)) {
                allASNDetails['lastResults'] = lastASNResults[lastASN]
              }
              allASNDetails['asnSet'] = Object.keys(lastASNResults)
              chrome.runtime.sendMessage({asnDetails: allASNDetails})
              console.log(`sending details to popup.js: ${JSON.stringify(allASNDetails)}`)
            })
          }
        }) 
      }
      if (request.newAlarmFrequency) {
        var alarmInt = parseInt(request.newAlarmFrequency);
        if (!isNaN(alarmInt)) {
          setAlarm(alarmInt)
          chrome.runtime.sendMessage({ alarmFrequency: alarmInt})
        }
      }
      if (request.getPopupFrequency) {
        chrome.storage.local.get(['alarmFrequency'], function(result) {
          chrome.runtime.sendMessage({ alarmFrequency: result.alarmFrequency})
        })
      }
    }
);


// Function to set the popup periodically
function setPopupPeriodically() {

  chrome.windows.create({
    type: 'popup',
    url: 'index.html',
    width: 700,
    height: 1200,
    // top: 100,
    // left: 100,
    top: 100,
    left: 100,
    // state: 'maximized'
  });
  console.log("setPopupPeriodically function")
}

// Set an initial alarm when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function() {
  setPopupPeriodically();
  // Create an alarm to set the popup periodically
  chrome.storage.local.get(['alarmFrequency'], function(result) {
    var popupAlarmFrequency = result.alarmFrequency || popupFrequency;
    setAlarm(popupAlarmFrequency)
  })
  console.log("Periodic Alarm Set")
});

// Handle the alarm event
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'setPopupAlarm') {
    setPopupPeriodically();
    console.log("Periodic onAlarm listener");
  }
});


function setAlarm(frequencyInMins) {
  chrome.storage.local.set({ alarmFrequency: frequencyInMins });
  chrome.alarms.create('setPopupAlarm', {
    periodInMinutes: frequencyInMins // Adjust the period as needed (in minutes)
  });
}
