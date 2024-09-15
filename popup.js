var startAdhocTestBtn = document.getElementById('startAdhocTest');
var checkHistBtn = document.getElementById('checkHistory');
var settingsOpnBtn = document.getElementById('settingsOpnBtn');
var settingsCloseBtn = document.getElementById('settingsCloseBtn');
var settingsSaveBtn = document.getElementById('settingsSaveBtn');
var feedbackText = document.getElementById('settingsSaveFeedback');
var settingsContainer = document.getElementById('settingsContainer');
var lastTestContainer = document.getElementById('lastTestContainer');
var manifest = chrome.runtime.getManifest();
var appVersion = manifest.version;
document.getElementById('appVerNum').textContent = appVersion
var lastTestASN = null;
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

startAdhocTestBtn.addEventListener('click', function() {
  console.log("startAdhocTest")
  chrome.windows.create({
    type: 'popup',
    url: 'index.html?action=startnewtest',
    width: 700,
    height: 1200,
    top: 100,
    left: 100
  });
});

checkHistBtn.addEventListener('click', function() {
  console.log("checkHistory")
  chrome.storage.local.get(['asnDetails'], function(result) {
    if (result.asnDetails) {
      console.log(`ASN: ${result.asnDetails.lastASN}`)
      chrome.windows.create({
        type: 'popup',
        url: `index.html?action=checkhistory&asn=${result.asnDetails.lastASN}`,
        width: 700,
        height: 1200,
        top: 100,
        left: 100
      });
    }

  })
  

  chrome.runtime.sendMessage({ action: 'startNewTest'});
  
  
});

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
  if (settingsContainer.style.display === 'none') {
    lastTestContainer.style.display = 'none';
    settingsContainer.style.display = 'block';
  }
  else if (settingsContainer.style.display === 'block'){
    lastTestContainer.style.display = 'block';
    settingsContainer.style.display = 'none';
  }
  
});

settingsCloseBtn.addEventListener('click', function() {
  console.log("Settings Close")
  document.getElementById('lastTestContainer').style.display = 'block';
  document.getElementById('settingsContainer').style.display = 'none';
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(`Received message: ${JSON.stringify(request)}`)
    if (request.asnDetails) {
      chrome.storage.local.set({ asnDetails: request.asnDetails });
      document.getElementById('ispText').textContent = request.asnDetails.lastASN
      document.getElementById('lastTestText').textContent = request.asnDetails.lastResults.timestamp
      printQOE(request.asnDetails.lastResults.qoe)
    }
    if (request.alarmFrequency) {
      document.getElementById('popupFrequency').value = request.alarmFrequency
      chrome.storage.local.set({popupFrequency: request.alarmFrequency})
    }
    if (request.measurementId) {
      document.getElementById('userIdNum').textContent = request.measurementId
    }
  })

chrome.runtime.sendMessage({ getASNDetails: 1});
chrome.runtime.sendMessage({ getPopupFrequency: 1});
chrome.runtime.sendMessage({retrieveUUID: 1})
console.log('popup.js loaded')