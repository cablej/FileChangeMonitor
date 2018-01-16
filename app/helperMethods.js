module.exports = {
  extractUrls: function(baseDomain, data, startingTag, trigger, extension) {
    if (baseDomain.endsWith('/')) baseDomain = baseDomain.substring(0, baseDomain.length - 1);
    let urls = new Set();
    let segments = data.split('<' + startingTag);
    for (let i=1; i < segments.length; i++) {
        let string = segments[i].substring(0, segments[i].indexOf('>'));
        if (string.includes(trigger) && string.includes(extension)) {
          let url = string.substring(string.indexOf(trigger) + trigger.length + 1,
            string.indexOf(extension));
          url = this.normalizeUrl(baseDomain, url);
          urls.add(url + '.js');
        }
    }
    return Array.from(urls);
  },
  normalizeUrl: function(baseDomain, url) {
    if (url.startsWith('//')) {
      return 'https' + url; 
    } else if (url.startsWith('/')) {
      return baseDomain + url;
    } else if(!url.startsWith('http')) {
      return baseDomain + '/' + url;
    } else {
      return url;
    }
  }
}