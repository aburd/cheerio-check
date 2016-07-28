var Promise = require('bluebird')
var request = Promise.promisifyAll(require('request'))
var cheerio = require('cheerio')
var chalk = require('chalk')

var startTime = Date.now()
var failuresCount = 0
// The information used to construct the URLs to search
var locations = {tokyo:["marunouchi-yusen-building", "marunouchi-trust-tower-main", "otemachi-tokyo-sankei-building", "nihonbashi-wakamatsu-building", "hibiya-central-building", "tri-seven-roppongi", "shiodome-shibarikyu-building", "shiroyama-trust-tower", "shinagawa-intercity-tower-a", "aoyama-palacio-tower", "yebisu-garden-place-tower", "shinjuku-nomura-building", "shinjuku-oak-city", "sunshine-city", "servcorp-tokyo-big-sight-ariake-frontier-building"], yokohama:[ "toc-minato-mirai"], osaka:["hilton-plaza-west-office-tower", "cartier-building-shinsaibashi-plaza", "edobori-center-building"], nagoya: ["nagoya-lucent-tower", "nagoya-nikko-shoken-building"], fukuoka: ["nof-hakata-ekimae-building", "fukuoka-tenjin-fukoku-seimei-building"]}
var baseUrl = 'http://www.servcorp.co.jp/'
// Constructs urls
function makeUrl(lang, city ,location){
  return baseUrl + lang + '/locations/' + city + '/' + location
}
// Set up promise array to keep in order
var urlsPromises = [] // holds the promises
for(city in locations){ // loops through to create promises in order
  locations[city].forEach((location)=>{
    var locationUrl = makeUrl('ja', city, location)
    urlsPromises.push( request.getAsync(locationUrl) )
  })
}

console.log('Downloading data...')
Promise.each(urlsPromises, (resObj, iterator) => { //using each will make sure each value is returned serially
  function spacer(spaceWord) {
    var res = '';
    for(var i = 0; i < spaceWord.length + 2; i++){
      res += ' '
    }
    return res
  }
  var i = (iterator + 1).toString()

  // Now parse the HTML and analyze
  var $ = cheerio.load(resObj.body)
  var reg = new RegExp('2016年7月')
  var months = $('.new-location .txt-14').text()
  if( !reg.test(months) ) {
    console.warn(i +
      '. Check failed at with...\n'+ spacer(i) +
      'Text: ' + chalk.yellow(months) + '. \n' + spacer(i) +
      'URL: ' + chalk.red(resObj.request.href) )
    failuresCount++
  }
  else {
    console.log(i + '. Ok.')
  }
})
.then(()=>{
  var endTime = Date.now()
  console.log(chalk.green('Finished in ' + (endTime - startTime).toString() + 'ms with ' + failuresCount.toString() + ' failures.'))
})
