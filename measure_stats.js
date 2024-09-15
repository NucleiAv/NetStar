// const { title } = require("process")

var performanceDict = new Object()
var speedTestResult = new Object()
var videoStreamingDASHMetrics = new Object()
var ipDetails = new Object()
let chartUpload = null
let chartDownload = null
let chartCurrentWebVal = null

var webBrowsingValues = new Object()
var webBrowsingHistValues = new Object()



var latency = 0
var packet_loss = 0
var uploadBWList = []
var downloadBWList = []
var meanClientDownBW = 0 
var meanClientUpBW = 0
var ttfbArr = [];
var connectTimeArr = [];
var dnsLookupTimeArr = [];
var tlsNegotiationTimeArr = [];
var bufferLevelArr = []
var bitrateArr = []
var framerateArr = []
var resolutionHeightArr = []
var droppedFramesArr = []
var qualityLevelArr = []
var meanBitrate = 0 
var dashPlaybackStart = 0
var meanQualityLevel = 0

var webBrowsingText = document.getElementById('webBrowsingText')
var videoStreamingText = document.getElementById('videoStreamingText')
var gamingText = document.getElementById('gamingText')
var teleConfText = document.getElementById('teleConfText')
var bwStatsContainer = document.getElementById('bwStatsContainer')
var testStatusText = document.getElementById('testStatusText')
var testProgressHeader = document.getElementById('inProgressHeader')
var homeBtnGroup = Array.from(document.getElementsByClassName('home-btn-group'))
var webDropdownContainer = document.getElementById("webCurrentDropdownContainer")
var bwCurrentDropdownContainer = document.getElementById("bwCurrentDropdownContainer")
var dashDropdownContainer = document.getElementById("dashDropdownContainer")
const dropdownContainers = document.querySelectorAll('.dropdown-container');
var manifest = chrome.runtime.getManifest();
var appVersion = manifest.version;
document.getElementById('appVerNum').textContent = appVersion

var lastTestDate;

var windowCloseTimeLeft = 60;
var timerCloseInterval = null;

var qualityStandard = {
  1 : {
    text: 'Good',
    color: 'green'
  },
  2 : {
    text: 'Ok',
    color: 'orange'
  },
  3 : {
    text: 'Poor',
    color: 'red'
  },
}

const urlList = [
  "https://www.w3.org/",
  "https://medium.com",
  "https://discord.com",
  "https://www.who.int",
  "https://www.shopify.com",
  "https://www.addtoany.com",
  "https://www.digitalocean.com",
  "https://www.worldbank.org/en/home",
  "https://coinmarketcap.com",
  "https://www.datadoghq.com",
  "https://www.checkpoint.com",
  "https://smallpdf.com/",
  "https://www.trustpilot.com",
  "https://www.merriam-webster.com",
];

const urlListNA = [
  "https://www.time.com/",
  "https://www.latimes.com/",
  "https://www.pbs.org/",
  "https://www.loc.gov/",
  "https://www.caliente.mx/",
  "https://creativecommons.org/",
]

const urlListSA = [
  "https://www.hostgator.com.br/",
  "https://www.ig.com.br/",
  "https://olhardigital.com.br/",
  "https://www.meteored.com.ar/",
  "https://nubank.com.br/",
  "https://www.placardefutebol.com.br/"
]

const urlListEU = [
  "https://european-union.europa.eu/index_en",
  "https://www.politico.eu/",
  "https://www.tagesspiegel.de/",
  "https://www.thesun.co.uk/",
  "https://www.t-online.de/",
  "https://www.repubblica.it/",
  "https://www.regjeringen.no/no/id4/",
  "https://www.skatteetaten.no/person/",
  "https://www.prisjakt.no/",
  "https://www.vinmonopolet.no/",
  "https://www.tek.no/",
  "https://www.xxl.no/"
];

const urlListAS = [
  "https://hochi.news/",
  "https://www.hmetro.com.my/",
  "https://line.me/en/",
  "https://www.timenews.co.id/",
  "https://www.biglobe.ne.jp/",
  "https://www.thestar.com.my/",
];

const urlListAU = [
  "https://www.unimelb.edu.au/",
  "https://www.griffith.edu.au/",
  "https://hipages.com.au/",
  "https://www.nsw.gov.au/",
  "https://www.unsw.edu.au/",
  "https://www.telstra.com.au/",
];

const urlListAF = [
"https://www.ietf.org/",
"https://about.gitlab.com/",
"https://surfshark.com/",
"https://www.geeksforgeeks.org/",
"https://www.warnerbros.com/",
"https://brave.com/"
];

const continentToUrlList = {
  'NA': urlListNA,
  'SA': urlListSA,
  'EU': urlListEU,
  'AF': urlListAF,
  'OC': urlListAU,
  'AS': urlListAS
}

var measUUID;
var urlsOpened = []

var s3_options = {
  endpoint: "https://cmvm10.cit.tum.de:9000",
  accessKeyId: "measurementUser",
  secretAccessKey: "nafcoj-jidqek-6ditXu",
  s3ForcePathStyle: 'true',
  signatureVersion: 'v4'
}


var s3 = new AWS.S3(s3_options)


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(`request: ${JSON.stringify(request)}`)
    if (request.measurementId) {
      setMeasurementId(request.measurementId)
      document.getElementById('userIdNum').textContent = request.measurementId
    }
    if (request.status) {
      urlsOpened.push(request.requestUrl)
      console.log(urlsOpened)
      const requestUrl = request.requestUrl
      if (request.status == "success"){
        if (!(requestUrl in performanceDict)) {
          performanceDict[requestUrl] = {}
        }
        performanceDict[requestUrl]['ip'] = request.ip
        performanceDict[requestUrl]['statusCode'] = request.statusCode
        performanceDict[requestUrl]['status'] = request.status
        performanceDict[requestUrl]['fromCache'] = request.fromCache
        if (request.x_amz_cf_pop) {
          performanceDict[requestUrl]['x_amz_cf_pop'] = request.x_amz_cf_pop
          performanceDict[requestUrl]['serverLoc'] = request.x_amz_cf_pop.substring(0,3)
        }
        if (request.cf_ray) {
          performanceDict[requestUrl]['cf_ray'] = request.cf_ray
          performanceDict[requestUrl]['serverLoc'] = request.cf_ray.substring(request.cf_ray.length - 3)
        }
        if (request.x_cache) {
          performanceDict[requestUrl]['x_cache'] = request.x_cache
        }
        if (request.cf_cache_status) {
          performanceDict[requestUrl]['cf_cache_status'] = request.cf_cache_status
        }
      } else if (request.status == "fail") {
        performanceDict[requestUrl] = {}
        performanceDict[requestUrl]['status'] = request.status
        performanceDict[requestUrl]['statusCode'] = request.statusCode
      }
    }
    if (request.performance) {
      const currentUrl = request.performance
      if (!(currentUrl in performanceDict)) {
        performanceDict[currentUrl] = {}
      }
      // performanceDict[currentUrl]['ttfb'] = request.ttfb
      // performanceDict[currentUrl]['latency'] = request.latency
      // performanceDict[currentUrl]['dnsLookupTime'] = request.dnsLookupTime
      // performanceDict[currentUrl]['tcpConnectTime'] = request.tcpConnectTime
      // performanceDict[currentUrl]['tlsNegotiationTime'] = request.tlsNegotiationTime
      // performanceDict[currentUrl]['firstContentfulPaint'] = request.firstContentfulPaint
      // performanceDict[currentUrl]['firstPaint'] = request.firstPaint
      // performanceDict[currentUrl]['pageLoadTime'] = request.pageLoadTime

      Object.entries(request).forEach(([key, value]) => {
        if (!key.includes('performance')) {
          performanceDict[currentUrl][key] = value
        }
        // console.log(`Key: ${key}, Value: ${value}`)
      })

      var cache_status_hit = false
      if (performanceDict[currentUrl].hasOwnProperty('x_cache')) {
        cache_status_hit = performanceDict[currentUrl]['x_cache'].toLowerCase().includes('hit')
      } else if (performanceDict[currentUrl].hasOwnProperty('cf_cache_status')) {
        cache_status_hit = performanceDict[currentUrl]['cf_cache_status'].toLowerCase().includes('hit')
      }
      if (performanceDict[currentUrl].hasOwnProperty('serverLoc') && cache_status_hit) {
        var server_loc = performanceDict[currentUrl]['serverLoc']
        if (!webBrowsingValues.hasOwnProperty(server_loc)) {
            webBrowsingValues[server_loc] = {
              ttfbArr : [],
              connectTimeArr: [],
              tlsNegotiationTimeArr: [],
              dnsLookupTimeArr: []
            }
        }
        if (request.ttfb) {
          webBrowsingValues[server_loc].ttfbArr.push(request.ttfb)
        }
        if (request.tcpConnectTime) {
          webBrowsingValues[server_loc].connectTimeArr.push(request.tcpConnectTime)
        }
        if (request.tlsNegotiationTime) {
          webBrowsingValues[server_loc].tlsNegotiationTimeArr.push(request.tlsNegotiationTime)
        }
        if (request.dnsLookupTime) {
          webBrowsingValues[server_loc].dnsLookupTimeArr.push(request.dnsLookupTime)
        }
        
        // webBrowsingValues[server_loc].connectTimeArr.push(request.tcpConnectTime)
        // webBrowsingValues[server_loc].tlsNegotiationTimeArr.push(request.tlsNegotiationTime)
        // webBrowsingValues[server_loc].dnsLookupTimeArr.push(request.dnsLookupTime)
        
      }
    } 
    if (request.speedTest) {
      var speedTestDict = request.speedTest
      if (speedTestDict.serverIP) {
        speedTestResult['serverIP'] = speedTestDict.serverIP
      }
      else if (speedTestDict.serverLocation) {
        speedTestResult['serverLocation'] = speedTestDict.serverLocation
      }
      else if (speedTestDict.clientIP) {
        speedTestResult['clientIP'] = speedTestDict.clientIP
      }
      else if (speedTestDict.clientASN) {
        speedTestResult['clientASN'] = speedTestDict.clientASN
      }
    }
    if (request.alarmFrequency) {
      document.getElementById('popupFrequency').value = request.alarmFrequency
      chrome.storage.local.set({popupFrequency: request.alarmFrequency})
    }
  }
);

function showWindowCloseTimer() {
  toggleWebDropdown()
  toggleBWDropdown()
  toggleDASHDropdown()
  windowCloseTimeLeft = 60
  document.getElementById("timerLabel").textContent = windowCloseTimeLeft
  document.getElementById("timerDiv").style.display = 'block'
  timerCloseInterval = setInterval(windowCloseTimer, 1000)
  document.getElementById("stopTimerLink").addEventListener('click', function(event) {
    event.preventDefault();
    clearInterval(timerCloseInterval);
    document.getElementById("timerDiv").style.display = 'none'
  });
}

function saveVoDDASHstats() {
  var timestampInMilliseconds = new Date().getTime();
  var timestampString = timestampInMilliseconds.toString();

  chrome.storage.local.get(['videoPlaybackDASH'], function(result) {
    var vodDict = videoStreamingDASHMetrics
    vodDict['timestamp'] = timestampInMilliseconds
    vodDict['buffer_level'] = bufferLevelArr
    vodDict['frame_rate'] = framerateArr
    vodDict['bitrate'] = bitrateArr
    vodDict['resolution_height'] = resolutionHeightArr

    var timeElapsed = result.videoPlaybackDASH || null;
    vodDict['videoPlaybackTimeStart'] = timeElapsed

    var filename = getMeasurementId() + "_VoD_DASH_" + timestampString + "_" + ipDetails['ISP_AS'] + ".json"
    var params = {
        Body: JSON.stringify(vodDict), 
        Bucket: "measurements", 
        Key: filename, 
    }
    console.log("Saving VoD streaming (DASH) stats to object storage")
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack) // an error occurred
        else     console.log(data)           // successful response
    })
  });
  
  showWindowCloseTimer()
  showResults()
}

function saveBandwidthStats() {
  var timestampInMilliseconds = new Date().getTime();
  var timestampString = timestampInMilliseconds.toString();
  var bwDict = speedTestResult
  bwDict['download_msm'] = downloadBWList
  bwDict['upload_msm'] = uploadBWList
  bwDict['timestamp'] = timestampInMilliseconds
  
  var filename = getMeasurementId() + "_speedTest_" + timestampString + "_" + ipDetails['ISP_AS'] + ".json"
  var params = {
      Body: JSON.stringify(bwDict), 
      Bucket: "measurements", 
      Key: filename, 
  }
  console.log("Saving bandwidth stats to object storage")
  s3.putObject(params, function(err, data) {
      if (err) console.log(err, err.stack) // an error occurred
      else     console.log(data)           // successful response
  })

  // windowCloseTimeLeft = 60
  // document.getElementById("timerLabel").textContent = windowCloseTimeLeft
  // document.getElementById("timerDiv").style.display = 'block'
  // timerCloseInterval = setInterval(windowCloseTimer, 1000)
  // document.getElementById("stopTimerLink").addEventListener('click', function(event) {
  //   event.preventDefault();
  //   clearInterval(timerCloseInterval);
  //   document.getElementById("timerDiv").style.display = 'none'
  // });
}

function saveBrowsingStats() {
    var timestampInMilliseconds = new Date().getTime();
    var timestampString = timestampInMilliseconds.toString();
    var completeTestObj = new Object()
    completeTestObj['client_details'] = ipDetails
    completeTestObj['client_details']['measurementID'] = getMeasurementId()
    completeTestObj['client_details']['timestamp'] = timestampInMilliseconds
    ipDetails['timestamp'] = timestampInMilliseconds
    completeTestObj['web_browsing'] = performanceDict
    
    var filename = getMeasurementId() + "_" + timestampString + "_" + ipDetails['ISP_AS'] + ".json"
    var params = {
        Body: JSON.stringify(completeTestObj), 
        Bucket: "measurements", 
        Key: filename, 
    }
    console.log("Saving browsing stats to object storage")
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack) // an error occurred
        else     console.log(data)           // successful response
    })
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getMeasurementId() {
  return measUUID;
}

function setMeasurementId(testId) {
  measUUID=testId;
}

function windowCloseTimer() {
  document.getElementById("timerLabel").textContent = windowCloseTimeLeft;
  
  if (windowCloseTimeLeft === 0) {
    document.getElementById("timerDiv").style.display = 'none'
    window.close()
  } else {
    windowCloseTimeLeft--;
  }
}

async function getIPGeolocationData() {


    var url = 'http://ip-api.com/json/?fields=query,city,as,continentCode'
    const ipRequest = new Request(url)
    const response = await fetch(ipRequest, {cache: "no-store"})
    const ipJsonDetails = await response.json()

    console.log(ipJsonDetails)

    ipDetails['IP']=ipJsonDetails.query
    ipDetails['City']=ipJsonDetails.city
    ipDetails['ISP_AS']=ipJsonDetails.as
    ipDetails['Continent'] = ipJsonDetails.continentCode
    document.getElementById("ispText").textContent = ipJsonDetails.as

    return ipJsonDetails.continentCode
}
function runNdt7SpeedTest(){
  chartCurrentASNBWValues()
  // bwStatsContainer.style.display = 'block'
  toggleWebDropdown()
  toggleBWDropdown()
  ndt7.test(
    {
        userAcceptedDataPolicy: true,
        downloadworkerfile: "./ndt7/src/ndt7-download-worker.js",
        uploadworkerfile: "./ndt7/src/ndt7-upload-worker.js",
        metadata: {
            client_name: 'ndt7-chrome-extension',
        },
    },
    {
        serverChosen: function (server) {
            console.log('Testing to:', {
                machine: server.machine,
                locations: server.location,
            });
            console.log(`${JSON.stringify(server)}`)
            speedTestResult['Server'] = {
              machine: server.machine,
              locations: server.location,
            }
        },
        downloadMeasurement: function (data) {
            if (data.Source === 'client') {
                meanClientDownBW = data.Data.MeanClientMbps.toFixed(2)
                downloadBWList.push(data.Data)
                if (chartDownload) {
                  chartDownload.series[0].points[0].update(parseFloat(meanClientDownBW))
                }
            }
        },
        downloadComplete: function (data) {
          try {
              // const serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
            const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
            speedTestResult["Download"]= {
              ConnectionInfo: data.LastServerMeasurement.ConnectionInfo
            }
            
            latency =  (data.LastServerMeasurement.TCPInfo.MinRTT / 1000)
            document.getElementById('latencyText').textContent = latency.toFixed(2) + ' ms'

            packet_loss = (data.LastServerMeasurement.TCPInfo.BytesRetrans / data.LastServerMeasurement.TCPInfo.BytesSent * 100)
            document.getElementById('packetLossText').textContent = packet_loss.toFixed(2) + '%'

          } catch (error) {
            console.log('Error:', error.message)
          } 
            
        },
        uploadMeasurement: function (data) {
            if (data.Source === 'server') {
                meanClientUpBW = (data.Data.TCPInfo.BytesReceived / data.Data.TCPInfo.ElapsedTime * 8).toFixed(2) 
                if (chartUpload) {
                  chartUpload.series[0].points[0].update(parseFloat(meanClientUpBW))
                }
            }
            else if (data.Source === 'client') {
                uploadBWList.push(data.Data)
            }
        },
        uploadComplete: function(data) {
          try {
            const bytesReceived = data.LastServerMeasurement.TCPInfo.BytesReceived;
            const elapsed = data.LastServerMeasurement.TCPInfo.ElapsedTime;
            const throughput =
            bytesReceived * 8 / elapsed;
            console.log(
                `Upload test completed in ${(elapsed / 1000000).toFixed(2)}s
Mean server throughput: ${throughput} Mbps`);
            console.log(`Upload data:${JSON.stringify(data)}`)
            speedTestResult["Upload"]= {
              ConnectionInfo: data.LastServerMeasurement.ConnectionInfo
            }
          } catch (error) {
            console.log('Error:', error.message)
          }
        },
        error: function (err) {
            console.log('Error while running the test:', err.message);
        },
    },
  ).then((exitcode) => {
    console.log("ndt7 test completed with exit code:", exitcode)
    // document.getElementById('testInProgressText').style.display = 'none';
    saveBandwidthStats()
    chrome.runtime.sendMessage({speedTestCompleted: 1})
    examineDashPerformance()
  });
}

function openTabsRecursively(newWindowId, urls, index) {
  if (index < urls.length) {
    chrome.tabs.create({ url: urls[index], active: true, windowId: newWindowId }, function(tab) {

      console.log(`Creating tab for:  ${urls[index]}`)

      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        console.log(`Changeinfo.status = ${changeInfo.status} for ${urls[index]}`)
        if (tabId === tab.id && changeInfo.status === 'complete') {
          // Remove the listener after the tab is fully loaded
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.remove(tabId, function() {
            console.log(`${tab.url} closed`)
          })
          
          // Open the next tab
          openTabsRecursively(newWindowId, urls, index + 1);
        }
      });
    });
  }
  else if (index === urls.length) {
    saveBrowsingStats()
    chrome.windows.remove(newWindowId);
    document.getElementById('currentMeasurementContainer').style.display = 'block'
    toggleWebDropdown()
    chartCurrentASNWebValues()
    runNdt7SpeedTest()
  }
}

function openTabs(allUrls) {
  console.log(allUrls)
  chrome.windows.create({
    type: 'normal',
    focused: false,
    state: 'minimized',
  }, function(newWindow) {
    // Access the ID of the new window
    openTabsRecursively(newWindow.id, allUrls, 0);
  });
  chrome.runtime.sendMessage({"store_msm": 1})
}

function setIcon(elementId, value) {
  const thresholds = {
    good: 100,
    okay: 200,
  };
  const iconElement = document.getElementById(elementId + 'Icon');
  if (value <= thresholds.good) {
    iconElement.innerHTML = '<span class="icon good">✔</span>';
  } else if (value <= thresholds.okay) {
    iconElement.innerHTML = '<span class="icon okay">!</span>';
  } else {
    iconElement.innerHTML = '<span class="icon bad">✘</span>';
  }
}

function computeQuality() {
  var qualityMetrics = {
    "web_browsing": null,
    "video_streaming": null,
    "gaming": null,
    "teleconferencing": null
  }
  if (latency < 40) {
    qualityMetrics["gaming"] = 1
  } else if (latency >= 40 && latency <= 70) {
    qualityMetrics["gaming"] = 2
  } else {
    qualityMetrics["gaming"] = 3
  }

  console.log(`BW latency: ${latency}`)

  // if (meanClientDownBW > 25) {
  //   qualityMetrics["video_streaming"] = 1
  // } else if (meanClientDownBW > 5 && meanClientDownBW <= 25) {
  //   qualityMetrics["video_streaming"] = 2
  // } else {
  //   qualityMetrics["video_streaming"] = 3
  // }
  console.log(`Dropped Frames arr length: ${droppedFramesArr.length}`)
  if (droppedFramesArr.length) {
    var numDroppedFrames = droppedFramesArr[droppedFramesArr.length - 1]
    var totalFrames = 30 * 30

    if ((numDroppedFrames/totalFrames) < 0.05) {
      qualityMetrics["video_streaming"] = 1
    } else if ((numDroppedFrames/totalFrames) > 0.05 && (numDroppedFrames/totalFrames) < 0.10) {
      qualityMetrics["video_streaming"] = 2
    } else {
      qualityMetrics["video_streaming"] = 3
    }
  }

  tele_bw = Math.min(meanClientDownBW,meanClientUpBW)

  if (tele_bw > 5) {
    qualityMetrics["teleconferencing"] = 1
  } else if (meanClientDownBW > 2 && meanClientDownBW <= 5) {
    qualityMetrics["teleconferencing"] = 2
  } else {
    qualityMetrics["teleconferencing"] = 3
  }
  var all_ttfbs = []

  for (const [key, value] of Object.entries(performanceDict)) {
    if (value.hasOwnProperty('ttfb')) {
      all_ttfbs.push(value['ttfb'])
    }
  }

  var avgTTFBVal = (all_ttfbs.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / all_ttfbs.length)

  if (avgTTFBVal < 200) {
    qualityMetrics["web_browsing"] = 1
  } else if (avgTTFBVal >=200 && avgTTFBVal <=600) {
    qualityMetrics["web_browsing"] = 2
  } else {
    qualityMetrics["web_browsing"] = 3
  }
  return qualityMetrics
}

function printQOE(qualityMetrics) {
  webBrowsingText.textContent = qualityStandard[qualityMetrics["web_browsing"]].text
  webBrowsingText.style.color = qualityStandard[qualityMetrics["web_browsing"]].color

  videoStreamingText.textContent = qualityStandard[qualityMetrics["video_streaming"]].text
  videoStreamingText.style.color = qualityStandard[qualityMetrics["video_streaming"]].color

  gamingText.textContent = qualityStandard[qualityMetrics["gaming"]].text
  gamingText.style.color = qualityStandard[qualityMetrics["gaming"]].color

  teleConfText.textContent = qualityStandard[qualityMetrics["teleconferencing"]].text
  teleConfText.style.color = qualityStandard[qualityMetrics["teleconferencing"]].color
}

function saveMeasurementHist(asn,values) {
  chrome.storage.local.get(['measurementValues'], function(result) {
    var all_values = result.measurementValues || {};
    var asn_values = null;
    qualityMetrics = computeQuality()
    printQOE(qualityMetrics)
    chrome.runtime.sendMessage({lastASN: {
                                          ASN: asn,
                                          lastResults : {timestamp: lastTestDate, qoe: qualityMetrics},
                              }})
    if (!all_values.hasOwnProperty(asn)) {
      all_values[asn] = new Object();
      addItemToDropdown("dropdownASNList",asn)
    }
    asn_values = all_values[asn]
    // run a for loop over values to get msm as key
    for (const [key, value] of Object.entries(values)) {
      var msm = key
      if (!asn_values.hasOwnProperty(msm)) {
        if (msm.includes('webBrowsingValues')) {
          asn_values[msm] = {};
        } else {
          asn_values[msm] = [];
        }
        
      }
      if (msm.includes('webBrowsingValues')) {
        for (const [serverLoc, allWebMsms] of Object.entries(value)) {
          allWebMsms['timestamp'] = [ipDetails['timestamp']]
          if (!asn_values[msm].hasOwnProperty(serverLoc)) {
            asn_values[msm][serverLoc] = allWebMsms
          } else {
            for (const [metric, valueArr] of Object.entries(allWebMsms)) {
              asn_values[msm][serverLoc][metric].push(valueArr[0])
            }

          }
        }
      } else {
        asn_values[msm].push([ipDetails['timestamp'],value])
      }
      
    }
    all_values[asn] = asn_values
    chrome.storage.local.set({ measurementValues: all_values });
    console.log(`all_values= ${JSON.stringify(all_values)}`)
    return null;
  });
}

function getMeasurementHist(asn, msm) {
  chrome.storage.local.get(['measurementValues'], function(result) {
    var all_values = result.measurementValues || {};
    if (all_values.hasOwnProperty(asn)) {
      var asn_values = all_values[asn]
      if (asn_values.hasOwnProperty(msm)) {
        return asn_values[msm];
      }
    }
    return null;
  });
}

function updateMeasurementValues() {
  chrome.storage.local.get(['measurementValues'], function(result) {
    const values = result.measurementValues || {};


    var lastTestDate = values.lastTestDate || 'N/A';
    // Optionally, update the last test date
    document.getElementById('lastTestDate').textContent = 'Last test run: ' + lastTestDate;
  });
}

function showResults() {

  // document.getElementById('testInProgressText').style.display = 'none';

  const valuesToStore = {
    webBrowsingValues: webBrowsingHistValues,  
    downloadSpeed: parseFloat(meanClientDownBW),
    uploadSpeed: parseFloat(meanClientUpBW),
    dashVoDPlaybackstart: parseFloat(dashPlaybackStart),
    dashVoDBitrate: parseFloat(meanBitrate),
    dashVoDQualityLevel: parseFloat(meanQualityLevel)
  };
  saveMeasurementHist(ipDetails['ISP_AS'], valuesToStore)
  lastTestDate = new Date().toLocaleString()
  chrome.runtime.sendMessage({'lastTestDate': lastTestDate})
  exBtn.disabled = false;
  exBtn.classList.add("hoverable")
  testStatusText.style.color = '#32A94C'
  testStatusText.textContent = 'Completed'
  homeBtnGroup.forEach(function(eachElement) {
    eachElement.style.display = 'block'
  })
  testProgressHeader.classList.remove("blinking")
  testProgressHeader.style.color = '#32A94C'
  testProgressHeader.textContent = "Test Completed"
}

function populateASNDropdown() {
  chrome.storage.local.get(['measurementValues'], function(result) {
    var all_values = result.measurementValues || {};
    var asnOptions = Object.keys(all_values)
    asnOptions.forEach((option) => {
      addItemToDropdown("dropdownASNList", option)
    });
  });
}

function addItemToDropdown(listId, itemName) {
  var newItem = document.createElement("li");
  newItem.setAttribute("data-thq", "thq-dropdown");
  newItem.setAttribute("class", "home-dropdown list-item");
  // Create a div element within the li
  var divElement = document.createElement("div");
  divElement.setAttribute("data-thq", "thq-dropdown-toggle");
  divElement.setAttribute("class", "home-dropdown-toggle1");

  // Create a span element within the div
  var spanElement = document.createElement("span");
  spanElement.setAttribute("class", "home-text02");
  spanElement.textContent = itemName;
  spanElement.addEventListener("click", clickASNItemHandler)
  // Append the span element to the div
  divElement.appendChild(spanElement);

  // Append the div element to the li
  newItem.appendChild(divElement);

  // Append the new li element to the existing UL
  document.getElementById(listId).appendChild(newItem);
}

function clickASNItemHandler() {

  if (timerCloseInterval != null) {
    clearInterval(timerCloseInterval)
  }
  document.getElementById("displayHeader").textContent = "Historical Overview"
  document.getElementById('currentMeasurementContainer').style.display = 'none'
  document.getElementById('histMeasurementContainer').style.display = 'block'
  document.getElementById("ispText").textContent = this.textContent
  // bwStatsContainer.style.display = 'none'
  document.getElementById('packetLossText').textContent = ""
  document.getElementById('latencyText').textContent = ""
  document.getElementById('infoHeader').style.display = 'none'
  webBrowsingText.textContent = ''
  videoStreamingText.textContent = ''
  gamingText.textContent = '' 
  teleConfText.textContent = ''
  testStatusText.textContent = ''
  homeBtnGroup.forEach(function(eachElement) {
    eachElement.style.display = 'block'
  })
  chartASNHistValues(this.textContent)
}


function chartASNHistValues(asn) {
  chrome.storage.local.get(['measurementValues'], function(result) {
    var all_values = result.measurementValues || {};
    var downloadBWData = all_values[asn]['downloadSpeed']
    var uploadBWData = all_values[asn]['uploadSpeed']
    console.log(downloadBWList)
    console.log(uploadBWList)
    Highcharts.chart('containerBWHist', {
      chart: {
          type: 'spline'
      },
      title: {
          text: null,
          align: 'left'
      },
      accessibility: {
          enabled: false
      },
      xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
              // don't display the year
              month: '%e. %b',
              year: '%b'
          },
          title: {
              text: 'Date'
          }
      },
      yAxis: {
          title: {
              text: 'Mbps'
          },
          min: 0
      },
      tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormat: '{point.x:%e. %b}: {point.y:.2f} Mbps'
      },
    
      plotOptions: {
          series: {
              marker: {
                  symbol: 'circle',
                  fillColor: '#FFFFFF',
                  enabled: true,
                  radius: 2.5,
                  lineWidth: 1,
                  lineColor: null
              }
          }
      },
      credits: {
        enabled: false
      },
      colors: ['#6CF', '#39F', '#06C', '#036', '#000'],
    
      // Define the data points. All series have a year of 1970/71 in order
      // to be compared on the same x axis. Note that in JavaScript, months start
      // at 0 for January, 1 for February etc.
      series: [
          {
              name: 'Download BW',
              data: downloadBWData
          },
          {
              name: 'Upload BW',
              data: uploadBWData
          },
      ]
    });

    var webValuesHist = all_values[asn]['webBrowsingValues']

    const avgTtfbHistArr = []
    const avgConnectTimeHistArr = []
    const avgDnsLookupTimeHistArr = []
    const avgTlsNegotiationTimeHistArr = []
    const serverLocationsHistArr = []
    
    for (const [key, value] of Object.entries(webValuesHist)) {
      serverLocationsHistArr.push(key)
      avgTtfbHistArr.push(parseFloat((value.avgTtfb.reduce((acc, num) => acc + num, 0)/ value.avgTtfb.length).toFixed(2)))
      avgConnectTimeHistArr.push(parseFloat((value.avgConnectTime.reduce((acc, num) => acc + num, 0)/ value.avgConnectTime.length).toFixed(2)))
      avgDnsLookupTimeHistArr.push(parseFloat((value.avgDnsLookupTime.reduce((acc, num) => acc + num, 0)/ value.avgDnsLookupTime.length).toFixed(2)))
      avgTlsNegotiationTimeHistArr.push(parseFloat((value.avgTlsNegotiationTime.reduce((acc, num) => acc + num, 0)/ value.avgTlsNegotiationTime.length).toFixed(2)))

    }


    Highcharts.chart('containerWebHist', {
      chart: {
          type: 'bar',
          responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    yAxis: {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -5
                        },
                        title: {
                            text: null
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
      },
      title: {
          text: null,
          align: 'left'
      },
      accessibility: {
        enabled: false
      },
      xAxis: {
          categories: serverLocationsHistArr,
          title: {
              text: 'CDN Server Locations'
          },
          gridLineWidth: 1,
          lineWidth: 0
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Latency (ms)',
              align: 'high'
          },
          labels: {
              overflow: 'justify'
          },
          gridLineWidth: 0
      },
      plotOptions: {
          bar: {
              borderRadius: '50%',
              dataLabels: {
                  enabled: true
              },
              groupPadding: 0.1,
              pointWidth: 10
          }
      },
      legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom',
          floating: true,
          backgroundColor:
              Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
          itemStyle: {
            fontSize: '8px'
          }
          
      },
      credits: {
          enabled: false
      },
      series: [{
          name: 'DNS Lookup',
          data: avgDnsLookupTimeHistArr
      }, {
          name: 'Server Connection',
          data: avgConnectTimeHistArr
      }, {
          name: 'TLS Negotiation',
          data: avgTlsNegotiationTimeHistArr
      }, {
          name: 'Time to First Byte',
          data: avgTtfbHistArr
      }]
    });


    var dashVoDQualityLevelList = all_values[asn]['dashVoDQualityLevel'] || []
    var dashVoDPlaybackstartList = all_values[asn]['dashVoDPlaybackstart'] || []
    var dashVoDBitrateList = all_values[asn]['dashVoDBitrate'] || []

    var monthlyStatsQL = {
      1 : [], 2 : [], 3 : [], 4 : [], 5 : [], 6 : [], 7 : [], 8 : [] , 9 : [], 10 : [], 11 : [], 12 : []
    }
    var monthlyStatsPlayStart = {
      1 : [], 2 : [], 3 : [], 4 : [], 5 : [], 6 : [], 7 : [], 8 : [] , 9 : [], 10 : [], 11 : [], 12 : []
    }
    var monthlyStatsBitrate = {
      1 : [], 2 : [], 3 : [], 4 : [], 5 : [], 6 : [], 7 : [], 8 : [] , 9 : [], 10 : [], 11 : [], 12 : []
    }


    console.log('Printing DASH quality level stats!')


    dashVoDQualityLevelList.forEach((item) => {
      if (item[0] != null) {
        var timestampDate = new Date(item[0])
        var qualityLevelItem = item[1]
        console.log(`Timestamp Date: ${timestampDate}`)
        console.log(`DASH QL: ${timestampDate.getMonth() + 1} : ${qualityLevelItem}`)

        var month = timestampDate.getMonth() + 1
        monthlyStatsQL[month].push(qualityLevelItem)
      }
    })

    dashVoDPlaybackstartList.forEach((item) => {
      if (item[0] != null) {
        var timestampDate = new Date(item[0])
        var playbackstartItem = item[1]
        console.log(`Timestamp Date: ${timestampDate}`)
        console.log(`DASH PL Start: ${timestampDate.getMonth() + 1} : ${playbackstartItem}`)

        var month = timestampDate.getMonth() + 1
        monthlyStatsPlayStart[month].push(playbackstartItem)
      }
    })

    dashVoDBitrateList.forEach((item) => {
      if (item[0] != null) {
        var timestampDate = new Date(item[0])
        var bitrateItem = item[1]
        console.log(`Timestamp Date: ${timestampDate}`)
        console.log(`DASH Bitrate: ${timestampDate.getMonth() + 1} : ${bitrateItem}`)

        var month = timestampDate.getMonth() + 1
        monthlyStatsBitrate[month].push(bitrateItem)
      }
    })


    console.log(`Monthly QL: ${JSON.stringify(monthlyStatsQL)}`)
    console.log(`Monthly PlayStart: ${JSON.stringify(monthlyStatsPlayStart)}`)
    console.log(`Monthly Bitrate: ${JSON.stringify(monthlyStatsBitrate)}`)
    
    var monthlyAvgQL = []
    var monthlyAvgPlayStart = []
    var monthlyAvgBitrate = []

    for (let month = 0; month < 12; month++) {
      var avgQL = parseFloat(((monthlyStatsQL[month+1].reduce((sum,qlItem) => sum+qlItem,0)) / monthlyStatsQL[month+1].length).toFixed(2))
      var avgPlayStart = parseFloat(((monthlyStatsPlayStart[month+1].reduce((sum,playStartItem) => sum+playStartItem,0)) / monthlyStatsPlayStart[month+1].length).toFixed(2))
      var avgBitrate = parseFloat(((monthlyStatsBitrate[month+1].reduce((sum,bitrateItem) => sum+bitrateItem,0)) / monthlyStatsBitrate[month+1].length).toFixed(2))

      if (avgQL > 0) {
        monthlyAvgQL.push(avgQL)
      } else {
        monthlyAvgQL.push(0)
      }

      if (avgPlayStart > 0) {
        monthlyAvgPlayStart.push(avgPlayStart)
      } else {
        monthlyAvgPlayStart.push(0)
      }

      if (avgBitrate > 0) {
        monthlyAvgBitrate.push(avgBitrate)
      } else {
        monthlyAvgBitrate.push(0)
      }

    }

    console.log(`Avg QL: ${monthlyAvgQL}`)
    console.log(`Avg PlayStart: ${monthlyAvgPlayStart}`)
    console.log(`Avg Bitrate: ${monthlyAvgBitrate}`)

    // VoD DASH stats
    Highcharts.chart('containerDASHHist', {
      chart: {
          zooming: {
              type: 'xy'
          }
      },
      title: {
          text: null,
          align: 'left'
      },
      // subtitle: {
      //     text: 'Source: WorldClimate.com',
      //     align: 'left'
      // },
      xAxis: [{
          categories: [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
          ],
          crosshair: true
      }],
      yAxis: [{ // Primary yAxis
          labels: {
              format: '{value} Kbps',
              style: {
                  color: Highcharts.getOptions().colors[2]
              }
          },
          title: {
              text: 'Bitrate',
              style: {
                  color: Highcharts.getOptions().colors[2]
              }
          },
          opposite: true
  
      }, { // Secondary yAxis
          gridLineWidth: 0,
          title: {
              text: 'Playback Start',
              style: {
                  color: Highcharts.getOptions().colors[0]
              }
          },
          labels: {
              format: '{value} ms',
              style: {
                  color: Highcharts.getOptions().colors[0]
              }
          }
  
      }, { // Tertiary yAxis
          gridLineWidth: 0,
          title: {
              text: 'Quality Level',
              style: {
                  color: Highcharts.getOptions().colors[1]
              }
          },
          labels: {
              format: '{value}',
              style: {
                  color: Highcharts.getOptions().colors[1]
              }
          },
          opposite: true
      }],
      tooltip: {
          shared: true
      },
      // legend: {
      //     layout: 'vertical',
      //     align: 'left',
      //     x: 80,
      //     verticalAlign: 'top',
      //     // y: 155,
      //     floating: true,
      //     backgroundColor:
      //         Highcharts.defaultOptions.legend.backgroundColor || // theme
      //         'rgba(255,255,255,0.25)'
      // },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },
      series: [{
          name: 'Playback Start',
          type: 'column',
          yAxis: 1,
          data: monthlyAvgPlayStart,
          tooltip: {
              valueSuffix: ' ms'
          }
  
      }, {
          name: 'Quality Level',
          type: 'spline',
          yAxis: 2,
          data: monthlyAvgQL,
          marker: {
              enabled: false
          },
          dashStyle: 'shortdot',
          tooltip: {
              valueSuffix: ''
          }
  
      }, {
          name: 'Bitrate',
          type: 'spline',
          data: monthlyAvgBitrate,
          tooltip: {
              valueSuffix: ' Kbps'
          }
      }],
      responsive: {
          rules: [{
              condition: {
                  maxWidth: 500
              },
              chartOptions: {
                  legend: {
                      floating: false,
                      layout: 'horizontal',
                      align: 'center',
                      verticalAlign: 'bottom',
                      x: 0,
                      y: 0
                  },
                  yAxis: [{
                      labels: {
                          align: 'right',
                          x: 0,
                          y: -6
                      },
                      showLastLabel: false
                  }, {
                      labels: {
                          align: 'left',
                          x: 0,
                          y: -6
                      },
                      showLastLabel: false
                  }, {
                      visible: false
                  }]
              }
          }]
      }
  });

  });
}

function chartCurrentASNBWValues() {

//   const gaugeOptions = {
//     chart: {
//         type: 'solidgauge'
//     },

//     title: null,

//     pane: {
//         center: ['50%', '85%'],
//         size: '100%',
//         startAngle: -90,
//         endAngle: 90,
//         background: {
//             backgroundColor:
//                 Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
//             innerRadius: '60%',
//             outerRadius: '100%',
//             shape: 'arc'
//         }
//     },

//     exporting: {
//         enabled: false
//     },

//     tooltip: {
//         enabled: false
//     },

//     // the value axis
//     yAxis: {
//         stops: [
//             [0.1, '#DF5353'], // red 
//             [0.3, '#DDDF0D'], // yellow
//             [0.7, '#55BF3B'] // green
//         ],
//         lineWidth: 0,
//         tickWidth: 0,
//         minorTickInterval: null,
//         tickAmount: 2,
//         title: {
//             y: -70
//         },
//         labels: {
//             y: 16
//         }
//     },

//     plotOptions: {
//         solidgauge: {
//             dataLabels: {
//                 y: 5,
//                 borderWidth: 0,
//                 useHTML: true
//             }
//         }
//     }
// };

// The download guage
chartDownload = Highcharts.chart('downBWCurrentContainer', {

  chart: {
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      height: '105%',
  },

  title: {
      text: 'Download'
  },

  pane: {
      startAngle: -90,
      endAngle: 240,
      background: null,
      center: ['50%', '55%'],
      size: '80%'
  },

  // the value axis
  yAxis: {
      min: 0,
      max: 1000,
      tickPixelInterval: 72,
      tickPosition: 'inside',
      tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
          distance: 20,
          style: {
              fontSize: '14px'
          }
      },
      lineWidth: 0,
      plotBands: [{
          from: 0,
          to: 25,
          color: '#DF5353', // red  
          thickness: 20,
          borderRadius: '50%'
      }, {
        from: 25,
        to: 50,
        color: '#ffA500', // orange
        thickness: 20,
        borderRadius: '50%'
      },{
        from: 50,
        to: 100,
        color: '#DDDF0D', // yellow
        thickness: 20,
        borderRadius: '50%'
      }, {
          from: 100,
          to: 600,
          color: '#55BF3B', // green
          thickness: 20,
          borderRadius: '50%'
      }, {
          from: 600,
          to: 1000,
          color: '#006400', // dark green
          thickness: 20
      }]
  },

  series: [{
      name: 'Speed',
      data: [0],
      tooltip: {
          valueSuffix: ' Mbps'
      },
      dataLabels: {
          format: '{y} Mb/s',
          borderWidth: 0,
          color: (
              Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color
          ) || '#333333',
          style: {
              fontSize: '16px'
          }
      },
      dial: {
          radius: '80%',
          backgroundColor: 'gray',
          baseWidth: 12,
          baseLength: '0%',
          rearLength: '0%'
      },
      pivot: {
          backgroundColor: 'gray',
          radius: 6
      }

  }]

});

// The upload gauge
chartUpload = Highcharts.chart('upBWCurrentContainer', {

  chart: {
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      height: '105%',
  },

  title: {
      text: 'Upload'
  },

  pane: {
      startAngle: -90,
      endAngle: 240,
      background: null,
      center: ['50%', '55%'],
      size: '80%'
  },

  // the value axis
  yAxis: {
      min: 0,
      max: 800,
      tickPixelInterval: 72,
      tickPosition: 'inside',
      tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
      tickLength: 20,
      tickWidth: 2,
      minorTickInterval: null,
      labels: {
          distance: 20,
          style: {
              fontSize: '14px'
          }
      },
      lineWidth: 0,
      plotBands: [{
          from: 0,
          to: 10,
          color: '#DF5353', // red  
          thickness: 20,
          borderRadius: '50%'
      }, {
        from: 10,
        to: 35,
        color: '#ffA500', // orange
        thickness: 20,
        borderRadius: '50%'
      }, {
        from: 35,
        to: 70,
        color: '#DDDF0D', // yellow
        thickness: 20,
        borderRadius: '50%'
      }, {
          from: 70,
          to: 500,
          color: '#55BF3B', // green
          thickness: 20,
          borderRadius: '50%'
      }, {
          from: 500,
          to: 800,
          color: '#006400', // dark green
          thickness: 20
      }]
  },

  series: [{
      name: 'Speed',
      data: [0],
      tooltip: {
          valueSuffix: ' Mbps'
      },
      dataLabels: {
          format: '{y} Mb/s',
          borderWidth: 0,
          color: (
              Highcharts.defaultOptions.title &&
              Highcharts.defaultOptions.title.style &&
              Highcharts.defaultOptions.title.style.color
          ) || '#333333',
          style: {
              fontSize: '16px'
          }
      },
      dial: {
          radius: '80%',
          backgroundColor: 'gray',
          baseWidth: 12,
          baseLength: '0%',
          rearLength: '0%'
      },
      pivot: {
          backgroundColor: 'gray',
          radius: 6
      }

  }]

});

}



function chartCurrentASNWebValues() {
  console.log('Plotting current web browsing metrics!')
  const avgTtfbArr = []
  const avgConnectTimeArr = []
  const avgDnsLookupTimeArr = []
  const avgtlsNegotiationTimeArr = []
  const serverLocationsArr = []

  console.log(`webBrowsingValues: ${JSON.stringify(webBrowsingValues)}`)

  for (const [key, value] of Object.entries(webBrowsingValues)) {
    serverLocationsArr.push(key)
    avgTtfbArr.push(parseFloat((value.ttfbArr.reduce((acc, num) => acc + num, 0)/ value.ttfbArr.length).toFixed(2)))
    avgConnectTimeArr.push(parseFloat((value.connectTimeArr.reduce((acc, num) => acc + num, 0)/ value.connectTimeArr.length).toFixed(2)))
    avgDnsLookupTimeArr.push(parseFloat((value.dnsLookupTimeArr.reduce((acc, num) => acc + num, 0)/ value.dnsLookupTimeArr.length).toFixed(2)))
    avgtlsNegotiationTimeArr.push(parseFloat((value.tlsNegotiationTimeArr.reduce((acc, num) => acc + num, 0)/ value.tlsNegotiationTimeArr.length).toFixed(2)))

    if (!webBrowsingHistValues.hasOwnProperty(key)) {
      webBrowsingHistValues[key] = {
        avgTtfb: 0,
        avgConnectTime: 0,
        avgDnsLookupTime: 0,
        avgTlsNegotiationTime: 0,
      }
    }

    webBrowsingHistValues[key]['avgTtfb'] = avgTtfbArr.slice(-1)
    webBrowsingHistValues[key]['avgConnectTime'] = avgConnectTimeArr.slice(-1)
    webBrowsingHistValues[key]['avgDnsLookupTime'] = avgDnsLookupTimeArr.slice(-1)
    webBrowsingHistValues[key]['avgTlsNegotiationTime'] = avgtlsNegotiationTimeArr.slice(-1)

  }

  chartCurrentWebVal = Highcharts.chart('webCurrentContainer', {
    chart: {
        type: 'bar',
        responsive: {
          rules: [{
              condition: {
                  maxWidth: 700
              },
              chartOptions: {
                  legend: {
                      align: 'center',
                      verticalAlign: 'bottom',
                      layout: 'horizontal'
                  },
                  yAxis: {
                      labels: {
                          align: 'left',
                          x: 0,
                          y: -5
                      },
                      title: {
                          text: null
                      }
                  },
                  subtitle: {
                      text: null
                  },
                  credits: {
                      enabled: false
                  }
              }
          }]
      }
    },
    title: {
        text: null,
        align: 'left'
    },
    accessibility: {
      enabled: false
    },
    xAxis: {
        categories: serverLocationsArr,
        title: {
            text: 'CDN Server Locations'
        },
        gridLineWidth: 1,
        lineWidth: 0
    },
    yAxis: {
        min: 0,
        title: {
            text: '(ms)',
            align: 'high'
        },
        labels: {
            overflow: 'allow'
        },
        gridLineWidth: 0
    },
    tooltip: {
        valueSuffix: ' ms'
    },
    plotOptions: {
        bar: {
            borderRadius: '50%',
            dataLabels: {
                enabled: true
            },
            groupPadding: 0.1,
            pointWidth: 10
        }
    },
    legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        floating: true,
        backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
        itemStyle: {
          fontSize: '8px'
        }
        
    },
    credits: {
        enabled: false
    },
    series: [{
        name: 'DNS Lookup',
        data: avgDnsLookupTimeArr
    }, {
        name: 'Server Connection',
        data: avgConnectTimeArr
    }, {
        name: 'TLS Negotiation',
        data: avgtlsNegotiationTimeArr
    }, {
        name: 'Time to First Byte',
        data: avgTtfbArr
    }]
  });
}


var showHistBWBtn = document.getElementById('dropdownASNDiv');
showHistBWBtn.addEventListener('click', function() {
  chrome.storage.local.get(['measurementValues'], function(result) {
    var all_values = result.measurementValues || {};
    console.log(`${JSON.stringify(all_values)}`)
  });
  
});

function onPageLoad() {
  testStatusText.style.color = '#14617b'
  testStatusText.textContent = 'N/A'
  homeBtnGroup.forEach(function(eachElement) {
    eachElement.style.display = 'block'
  })
  const currentUrl = window.location.href;
  chrome.windows.getCurrent(function(window) {

    extensionWindowId = window.id;
    chrome.storage.local.set({extensionWindowId: window.id})
  });
  // Create a URLSearchParams object with the query parameters
  const searchParams = new URLSearchParams(currentUrl.split('?')[1]);
  // Access individual parameters
  const action_type = searchParams.get('action');
  if (action_type === 'checkhistory') {

    const asn_value = searchParams.get('asn');
    if (asn_value != 'null') {
      document.getElementById("displayHeader").textContent = "Historical Overview"
      document.getElementById('currentMeasurementContainer').style.display = 'none'
      document.getElementById('histMeasurementContainer').style.display = 'block'
      document.getElementById("ispText").textContent = asn_value
      chartASNHistValues(asn_value)
      console.log(`Check history for asn: ${asn_value}`)
    }
    
  }
  else {
    testSteps()
    // document.getElementById('currentMeasurementContainer').style.display = 'block'
    console.log("Started New Test")
  }
}


var settingsOpnBtn = document.getElementById('settingsOpnBtn');
var settingsCloseBtn = document.getElementById('settingsCloseBtn');
var settingsSaveBtn = document.getElementById('settingsSaveBtn');
var feedbackText = document.getElementById('settingsSaveFeedback');


settingsSaveBtn.addEventListener('click', function() {
  console.log("Settings Saved")
  chrome.storage.local.get(['popupFrequency'], function(result) {
    var newPopupFrequency = document.getElementById('popupFrequency').value
    if (result.popupFrequency != newPopupFrequency){
      console.log(`result.popupFrequency: ${result.popupFrequency}`)
      console.log(`newPopupFrequency: ${result.popupFrequency}`)
      chrome.runtime.sendMessage({ newAlarmFrequency: newPopupFrequency})
      feedbackText.textContent = 'New Settings applied!'
      feedbackText.style.color = '#32A94C'
      feedbackText.style.display = 'block'
      chrome.storage.local.set({popupFrequency: newPopupFrequency})
      setTimeout(function() {
        feedbackText.style.display = 'none'
      }, 2500);
      
    }
    else {
      feedbackText.textContent = 'Popup Frequency value unchanged!'
      feedbackText.style.color = '#BF2626'
      feedbackText.style.display = 'block'
      setTimeout(function() {
        feedbackText.style.display = 'none'
      }, 2500);
    }
  })
});
settingsOpnBtn.addEventListener('click', function() {
  console.log("Settings Open")
  // document.getElementById('lastTestContainer').style.display = 'none';
  document.getElementById('settingsContainer').style.display = 'block';
});

settingsCloseBtn.addEventListener('click', function() {
  console.log("Settings Close")
  // document.getElementById('lastTestContainer').style.display = 'block';
  document.getElementById('settingsContainer').style.display = 'none';
});

function examineDashPerformance() {
  document.getElementById('currentMeasurementContainer').style.display = 'block'
  document.getElementById('videoPlayer').style.display = 'block'
  toggleBWDropdown()
  toggleDASHDropdown()
  // document.getElementById("dashDropdownContainer").style.display = 'block'
  var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd";
  // var url = "https://cmafref.akamaized.net/cmaf/live-ull/2006350/akambr/out.mpd";
  // var url = "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.mpd";
  // var url = "https://customer-m033z5x00ks6nunl.cloudflarestream.com/ea95132c15732412d22c1476fa83f27a/manifest/video.mpd";
  var player = dashjs.MediaPlayer().create();
  
  const videoRequestedTimestamp = Date.now();
  player.initialize(document.querySelector("#videoPlayer"), url, true);

  if (player.isReady()) 
  

  player.on(dashjs.MediaPlayer.events["PLAYBACK_ENDED"], function () {
    // clearInterval(eventPoller);
    clearInterval(extractDASHMetrics);
    console.log('Playback ended')
  });

  player.on(dashjs.MediaPlayer.events["CAN_PLAY"], function () {
    // clearInterval(eventPoller);
    console.log('Video is now playable!')
    var timeElapsed = Date.now() - videoRequestedTimestamp;
    console.log(`Video is now playable after ${timeElapsed} ms!`);
  });

  player.on(dashjs.MediaPlayer.events["PLAYBACK_STARTED"], function () {
    // clearInterval(eventPoller);
    var timeElapsed = Date.now() - videoRequestedTimestamp;
    console.log(`Video playback started after ${timeElapsed} ms!`)
    chrome.storage.local.set({videoPlaybackDASH: timeElapsed})
    dashPlaybackStart =  timeElapsed
  });


  video = document.querySelector("video");

  var bufferChart = Highcharts.chart('bufferCurrentContainer', {
      chart: {
          type: 'line'
      },
      title: {
          text: 'Buffer Level'
      },

      xAxis: {
          title : {
            text: 'Time (s)'
          }
      },
      yAxis: {
          title: {
              text: 'Buffer Level (secs)'
          }
      },
      plotOptions: {
          line: {
              enableMouseTracking: false
          }
      },
      series: [{
          name: 'Buffer Level',
          data: [0,]
      }]
});

var bitrateChart = Highcharts.chart('bitrateCurrentContainer', {
  chart: {
      type: 'line'
  },
  title: {
      text: 'Bitrate'
  },
  xAxis: {
      title : {
        text: 'Time (s)'
      }
  },
  yAxis: {
      title: {
          text: 'Bitrate (Kbps)'
      }
  },
  plotOptions: {
      line: {
          enableMouseTracking: false
      }
  },
  series: [{
      name: 'Bitrate',
      data: [0,]
  }]
});

var resolutionChart = Highcharts.chart('resolutionCurrentContainer', {
  chart: {
      type: 'line'
  },
  title: {
      text: 'Resolution'
  },
  xAxis: {
      title : {
        text: 'Time (s)'
      }
  },
  yAxis: {
      title: {
          text: 'Resolution (height in px)'
      }
  },
  plotOptions: {
      line: {
          enableMouseTracking: false
      }
  },
  series: [{
      name: 'Resolution',
      data: [0,]
  }]
});

var framerateChart = Highcharts.chart('framerateCurrentContainer', {
  chart: {
      type: 'line'
  },
  title: {
      text: 'Framerate'
  },
  xAxis: {
      title : {
        text: 'Time (s)'
      }
  },
  yAxis: {
      title: {
          text: 'FPS'
      }
  },
  plotOptions: {
      line: {
          enableMouseTracking: false
      }
  },
  series: [{
      name: 'Framerate',
      data: [0,]
  }]
});


  timeInSeconds = 0
  var lastDecodedByteCount = 0;



  var extractDASHMetrics = setInterval(function () {
    var activeStream = player.getActiveStream()

    if (activeStream == null){
      clearInterval(extractDASHMetrics)
      console.error('ERROR: No active streams founds. Exiting!')
      throw "DASH experiment failed!"
    }

    var streamInfo = activeStream.getStreamInfo();
    var dashMetrics = player.getDashMetrics();
    var dashAdapter = player.getDashAdapter();
    if (dashMetrics) {
        const periodIdx = streamInfo.index;
        var repSwitch = dashMetrics.getCurrentRepresentationSwitch('video', true);
        var bufferLevel = dashMetrics.getCurrentBufferLevel('video', true);
        var currentFrameStats = dashMetrics.getCurrentDroppedFrames('video', true);
        // var bitrate = repSwitch ? Math.round(dashAdapter.getBandwidthForRepresentation(repSwitch.to, periodIdx) / 1000) : NaN;
        var adaptation = dashAdapter.getAdaptationForType(periodIdx, 'video', streamInfo);
        var currentRep = adaptation.Representation_asArray.find(function (rep) {
            return rep.id === repSwitch.to
        })
        var frameRate = currentRep.frameRate;
        var resolution = currentRep.width + 'x' + currentRep.height;
        var qualityLevel = player.getQualityFor('video')
        // document.getElementById('bufferLevel').innerText = bufferLevel + " secs";
        // document.getElementById('framerate').innerText = frameRate + " fps";
        // document.getElementById('reportedBitrate').innerText = bitrate + " Kbps";
        // document.getElementById('resolution').innerText = resolution;
        console.log(`BufferLevel=${bufferLevel} secs`)
        console.log(`FrameRate=${frameRate} fps`)
        console.log(`Resolution: ${resolution}`)
        // console.log(`Dropped Frames: ${currentFrameStats.droppedFrames}`)
        // console.log(`Current Live Latency: ${player.getCurrentLiveLatency()}`)
        // console.log(`Current Buffer Length: ${player.getBufferLength('video')}`)
        // console.log(`Current Avg Throughput: ${player.getAverageThroughput('video')}`)
        console.log(`Current Quality level: ${qualityLevel}`)
        // console.log(`Reported Bitrate=${bitrate} Kbps`)
        // const x = timeInSeconds, // current time
        calc_buffer = bufferLevel;
        bufferChart.series[0].addPoint(calc_buffer);
        resolutionChart.series[0].addPoint(currentRep.height)
        framerateChart.series[0].addPoint(frameRate)

        bufferLevelArr.push(calc_buffer)
        resolutionHeightArr.push(currentRep.height)
        framerateArr.push(frameRate)
        droppedFramesArr.push(currentFrameStats.droppedFrames)
        qualityLevelArr.push(qualityLevel)
    }
    if (video.webkitVideoDecodedByteCount !== undefined) {
      var calculatedBitrate = (((video.webkitVideoDecodedByteCount - lastDecodedByteCount) / 1000) * 8);
      // document.getElementById('calculatedBitrate').innerText = Math.round(calculatedBitrate) + " Kbps";
      console.log(`Calculated video Bitrate=${Math.round(calculatedBitrate)} Kbps`)
      lastDecodedByteCount = video.webkitVideoDecodedByteCount;
      calc_bitrate = Math.round(calculatedBitrate)
      bitrateChart.series[0].addPoint(calc_bitrate)

      bitrateArr.push(calculatedBitrate)
    }
    timeInSeconds += 1
    if (timeInSeconds == 30) {
      player.destroy();
      clearInterval(extractDASHMetrics);
      toggleDASHDropdown()
      document.getElementById('videoPlayer').style.display = 'none'
      meanQualityLevel = (qualityLevelArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / qualityLevelArr.length)
      meanBitrate = (bitrateArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / bitrateArr.length)
      console.log(`DASH playback started after ${dashPlaybackStart}`) 
      saveVoDDASHstats()
    }
  }, 1000);

}




async function testSteps(){
  exBtn.disabled = true
  exBtn.classList.remove("hoverable")
  // document.getElementById('testInProgressText').style.display = 'block';
  document.getElementById("displayHeader").textContent = "Current Overview"
  document.getElementById('currentMeasurementContainer').style.display = 'none'
  document.getElementById('histMeasurementContainer').style.display = 'none'
  document.getElementById("ispText").textContent = 'N/A'
  // bwStatsContainer.style.display = 'none'
  document.getElementById('packetLossText').textContent = ""
  document.getElementById('latencyText').textContent = ""
  webBrowsingText.textContent = '?'
  webBrowsingText.style.color = '#14617b'
  videoStreamingText.textContent = '?'
  videoStreamingText.style.color = '#14617b'
  gamingText.textContent = '?'
  gamingText.style.color = '#14617b'
  teleConfText.textContent = '?'
  teleConfText.style.color = '#14617b'
  testStatusText.style.color ='#E14747'
  testStatusText.textContent = "In Progress"
  homeBtnGroup.forEach(function(eachElement) {
    eachElement.style.display = 'none'
  })
  document.getElementById('infoHeader').style.display = 'block'
  testProgressHeader.style.color ='#E14747'
  testProgressHeader.textContent = 'Test in progress...'
  testProgressHeader.classList.add("blinking")
  
  var continentCode = await getIPGeolocationData()

  regionUrls = continentToUrlList[continentCode]

  var allUrls = urlList.concat(regionUrls) 

  chrome.browsingData.remove({
    "origins": urlList
  }, {
    "appcache": true,
    "cache": true,
    "cacheStorage": true,
    "localStorage": true,
  }, function () {}
  );
  
  openTabs(allUrls)
  document.getElementById('currentMeasurementContainer').style.display = 'block'
  // runNdt7SpeedTest()
  // examineDashPerformance()
 
  console.log("All steps run")
}

var exBtn = document.getElementById('startMeasurementBtn');
exBtn.addEventListener('click', function() {
  if (timerCloseInterval != null) {
    clearInterval(timerCloseInterval)
    document.getElementById("timerDiv").style.display = 'none'
  }
  testSteps()
});

populateASNDropdown()
chrome.runtime.sendMessage({ getPopupFrequency: 1});
chrome.runtime.sendMessage({retrieveUUID: 1})
window.addEventListener('load', onPageLoad);

window.onerror = function(message, source, lineno, colno, error) {
  // Handle the error here
  testStatusText.style.color = '#A22020'
  testStatusText.textContent = "Failed"
  homeBtnGroup.forEach(function(eachElement) {
    eachElement.style.display = 'block'
  })
  testProgressHeader.classList.remove("blinking")
  testProgressHeader.style.color = '#A22020'
  testProgressHeader.textContent = "Failed"

  console.error("An error occurred:", message, "at", source, "line", lineno, "column", colno);
};

// function activateDropdownContainer(container) {
//   container.classList.add('active');
// }

// function disableDropdownContainer(container) {
//   container.classList.remove('active');
// }

// dropdownContainers.forEach(container => {
//   const header = container.querySelector('.dropdown-header');
//   header.addEventListener('click', () => {
//     if (!container.classList.contains('active')) {
//       activateDropdownContainer(container);
//     }
//   });
// });

var webDropdownHeader = document.getElementById('webDropdownHeader')
var bwDropdownHeader = document.getElementById('bwDropdownHeader')
var dashDropdownHeader = document.getElementById('dashDropdownHeader')

function toggleWebDropdown() {
  var webContainer = document.getElementById('webCurrentContainer')
  var dropdownBtn = document.getElementById('webDropdownBtn')
  if (webContainer.style.display === "none") {
    webContainer.style.display = "block";
    dropdownBtn.src = "img/dropdown-up.png"
    dropdownBtn.title = "Compress"
  } else {
    webContainer.style.display = "none";
    dropdownBtn.src = "img/dropdown-down.png"
    dropdownBtn.title = "Expand"
  }
}

function toggleBWDropdown() {
  var bwDropdownContainer = document.getElementById('bwDropdownContainer')
  var dropdownBtn = document.getElementById('bwDropdownBtn')
  if (bwDropdownContainer.style.display === "none") {
    bwDropdownContainer.style.display = "block";
    dropdownBtn.src = "img/dropdown-up.png"
    dropdownBtn.title = "Compress"
  } else {
    bwDropdownContainer.style.display = "none";
    dropdownBtn.src = "img/dropdown-down.png"
    dropdownBtn.title = "Expand"
  }
}

function toggleDASHDropdown() {
  var dashDropdownContainer = document.getElementById('dashDropdownContainer')
  var dropdownBtn = document.getElementById('dashDropdownBtn')
  if (dashDropdownContainer.style.display === "none") {
    dashDropdownContainer.style.display = "block";
    dropdownBtn.src = "img/dropdown-up.png"
    dropdownBtn.title = "Compress"
  } else {
    dashDropdownContainer.style.display = "none";
    dropdownBtn.src = "img/dropdown-down.png"
    dropdownBtn.title = "Expand"
  }
}

webDropdownHeader.addEventListener('click', () => {
  toggleWebDropdown()
});

bwDropdownHeader.addEventListener('click', () => {
  toggleBWDropdown()
});

dashDropdownHeader.addEventListener('click', () => {
  toggleDASHDropdown()
});

console.log("measure_stats.js loaded")
