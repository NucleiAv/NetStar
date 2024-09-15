var stats_dict = new Object()

var ttfb = 0
var latency = 0
var dnsLookupTime = 0
var tcpConnectTime = 0
var pageLoadTime = 0
var firstPaint = 0
var firstContentfulPaint = 0

function getTimings(entryList) {
  // Check if the browser supports the PerformanceNavigationTiming API

    console.log("Capturing navigation and paint entries")
    const navigationEntries = entryList.getEntriesByType('navigation');
    const paintEntries = entryList.getEntriesByType('paint');

    console.log(`Navigation entries: ${JSON.stringify(navigationEntries)}`)
    console.log(`Paint entries: ${JSON.stringify(paintEntries)}`)

    console.log(`Navigation entries length: ${navigationEntries.length}`)
    console.log(`Paint entries length: ${paintEntries.length}`)


    if (navigationEntries.length > 0) {
      console.log("Found navigation entries")
      const navigationTiming = navigationEntries[0];

      // Time To First Byte (TTFB)/ Server Response Time
      ttfb = navigationTiming.responseStart - navigationTiming.requestStart;

      // Latency
      latency = navigationTiming.responseStart - navigationTiming.fetchStart;

      // DNS Lookup Time
      dnsLookupTime = navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart;

      // TCP Connect Time
      tcpConnectTime = navigationTiming.connectEnd - navigationTiming.connectStart;

      // TLS Negotiation Time
      tlsNegotiationTime = navigationTiming.requestStart - navigationTiming.secureConnectionStart;

      // Page Load Time
      pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime


      console.log('ttfb:', ttfb);
      console.log('latency:', latency);
      console.log('dnsLookupTime:', dnsLookupTime);
      console.log('tcpConnectTime:', tcpConnectTime);
      console.log('tlsNegotiationTime:', tlsNegotiationTime);
      console.log('pageLoadTime', pageLoadTime);


      stats_dict = {
        "performance": window.location.href,
        "ttfb": ttfb,
        "latency": latency,
        "dnsLookupTime": dnsLookupTime,
        "tcpConnectTime": tcpConnectTime, 
        "tlsNegotiationTime": tlsNegotiationTime,
        "pageLoadTime": pageLoadTime,
      }

      console.log('Sending performance navigation stats to measure_stats.js')  
      chrome.runtime.sendMessage(stats_dict);  

      
      // const pltStart = navigationTiming.loadEventStart - navigationTiming.navigationStart;
      // const pltUserTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
      // const requestTime = navigationTiming.responseEnd - navigationTiming.requestStart;
      // const fetchTime = navigationTiming.responseEnd - navigationTiming.fetchStart;
      // const serverResponseTime = navigationTiming.responseStart - navigationTiming.requestStart;

      // stats_dict = {
      //   "performance": window.location.href,
      //   "ttfb": ttfb,
      //   "latency": latency,
      //   "dnsLookupTime": dnsLookupTime,
      //   "tcpConnectTime": tcpConnectTime, 
      //   "tlsNegotiationTime": tlsNegotiationTime,
      // }
      
      // console.log('Sending performance stats to measure_stats.js')  
      // chrome.runtime.sendMessage(stats_dict);  
      // console.log(`navigationEntries: ${window.location.href}`)
      // console.log('ttfb:', ttfb);
      // console.log('latency:', latency);
      // console.log('dnsLookupTime:', dnsLookupTime);
      // console.log('tcpConnectTime:', tcpConnectTime);
      // console.log('tlsNegotiationTime:', tlsNegotiationTime);
      // console.log('pltStart', pltStart)
      // console.log('pltUserTime', pltUserTime)
      // console.log('requestTime', requestTime)
      // console.log('fetchTime', fetchTime)
      // console.log('serverResponseTime', serverResponseTime)
      // console.log('#######################################')
      // console.log()
      // console.log('navigationTiming.loadEventStart', navigationTiming.loadEventStart)
      // console.log('navigationTiming.loadEventEnd', navigationTiming.loadEventEnd)
      // console.log('navigationTiming.domInteractive', navigationTiming.domInteractive)
      // console.log('navigationTiming.domContentLoadedEventStart', navigationTiming.domContentLoadedEventStart)
      // console.log('navigationTiming.domContentLoadedEventEnd', navigationTiming.domContentLoadedEventEnd)
      // console.log('#######################################')

    }

    if (paintEntries.length > 0) {
      console.log("Found paint entries")
      try {
        for (var i=0; i<paintEntries.length; i++) {
            var pJson = paintEntries[i].toJSON();
            if (pJson.name == 'first-paint') {
                firstPaint = pJson.startTime;
                console.log(`FP: ${firstPaint}`)
            } else if (pJson.name == 'first-contentful-paint') {
                firstContentfulPaint = pJson.startTime;
                console.log(`FCP: ${firstContentfulPaint}`)
            }
        }
        if (firstContentfulPaint > 0 || firstPaint > 0) {
          var paint_stats_dict = {
            "performance": window.location.href,
            "firstContentfulPaint": firstContentfulPaint,
            "firstPaint": firstPaint,
          }
          console.log('Sending performance paint stats to measure_stats.js')  
          chrome.runtime.sendMessage(paint_stats_dict);  
        }
        
    } catch(e) {
      console.log("Error capturing paint entries")
    }
    }

}

const observer = new PerformanceObserver((list) => {
  getTimings(list);
});

// Start observing the relevant entry types
observer.observe({ type: 'navigation', buffered: true });
observer.observe({ type: 'paint', buffered: true });

