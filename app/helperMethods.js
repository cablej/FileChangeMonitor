let sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

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
      return 'https:' + url; 
    } else if (url.startsWith('/')) {
      if (baseDomain.lastIndexOf('/') == -1 || baseDomain.lastIndexOf('/') == baseDomain.indexOf('//') + 1) {
        return baseDomain + url;
      } else {
        return baseDomain.substring(0, baseDomain.lastIndexOf('/')) + url;
      }
    } else if(!url.startsWith('http')) {
      if (baseDomain.lastIndexOf('/') == -1 || baseDomain.lastIndexOf('/') == baseDomain.indexOf('//') + 1) {
        return baseDomain + '/' + url;
      } else {
        return baseDomain.substring(0, baseDomain.lastIndexOf('/')) + '/' + url;
      }
    } else {
      return url;
    }
  },
  randomInt: function(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  },
  sendUpdateEmail: function(to, fileResponse) {
    let html =`<h3>An update has been detected for ${fileResponse.file.url}.</h3>
<p>Changes to relative urls:</p>
<pre>${this.getFormattedDiff(fileResponse.urlsDiff)}</pre>
<p>Changes to text:</p>
<pre>${this.getFormattedDiff(fileResponse.diff)}</pre>
<p><a href='https://filechangemonitor.herokuapp.com/file/${fileResponse.file.id}/'>View the file on File Change Monitor.</a></p>
`;
    const msg = {
      to: to,
      from: process.env.FROM_EMAIL,
      subject: '[FileChangeMonitor] Update for ' + fileResponse.file.url,
      html: html,
    };
    sgMail.send(msg).then(() => {
      console.log('Email sent successfully to ' + to)
    }) .catch(error => {
      //Log friendly error
      console.error(error.toString());
    });;
  },
  getFormattedDiff(diff) {
    let formattedDiff = '';
    for (diffString of diff) {
      // concat diffString
      trimmedValue = diffString.value.substring(0, 100);
      if (diffString.length > 100) trimmedValue += '...';
      if (diffString.added) {
        formattedDiff += '<span style="color:green">' + this.filterString(trimmedValue) + '</span>';
      } else if (diffString.removed) {
        formattedDiff += '<span style="color:red">' + this.filterString(trimmedValue) + '</span>';
      } else {
        // formattedDiff += diffString.value;
      }
    }
    return formattedDiff;
  },
  filterString(string) {
    return string.replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
}