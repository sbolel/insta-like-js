/**
 * @desc Injects jQuery into Instagram feed page and likes X posts at a time
 *
 * Usage: Open https://www.instagram.com/ in Chrome and login to view your feed;
 *        run this script in the JS console to like posts in your feed in batches.
 *
 * @param {number} start - starting post index (should be 0 unless manually continuing a prev. exec.)
 * @param {number} count - number of posts to like per batch (like X posts, wait a little, repeat)
 * @param {number} interval - number of milliseconds to wait between batches, +/- some randomness
 */
(function(start, count, interval) {
  // @todo find like button without using hard-coded class selector.
  // note: "._tk4ba" was the button class in my feed when I tried this out.
  const selector = '._tk4ba'
  
  const _body = () => document.getElementsByTagName('body')[0]
  const _getButtons = () => $('._tk4ba').toArray()
  const _plusOrMinus = () => Math.random() < 0.5 ? -1 : 1
  const _randomTimeout = () => (_plusOrMinus() * Math.floor((Math.random() * 500))) + 1500
  const _scrollToBottom = () => _body().scrollTop = _body().scrollHeight

  function _inject(doc, cb) {
    return (opts => {
      return Array.isArray(opts)
        ? Promise.all(opts.map(item => this.loadScript(item, opts)))
        : new Promise((resolve, reject) => {
          let r = false
          const t = doc.getElementsByTagName('script')[0]
          const s = doc.createElement('script')
          if (typeof opts === 'object' && typeof opts.src !== 'undefined') {
            for (key in opts) s[key] = opts[key]
          } else if (typeof opts === 'string') {
            s.src = opts
          } else {
            throw new Error('Script src undefined')
          }
          s.onerror = s.onabort = reject
          s.onload = s.onreadystatechange = () => {
            if (!r && (!this.readyState || this.readyState == 'complete')) {
              r = true
              resolve(s.src)
            }
          }
          t.parentNode.insertBefore(s, t)
        })
    })({
      async: true,
      src: 'https://code.jquery.com/jquery-3.2.1.min.js',
      type: 'text/javascript'
    })
    .then(src => {
      console.log('Injected', src)
      _body.scrollTop = 0;
    })
  }

  function _like(els) {
    if (!els || typeof els === 'undefined' || els.length < 1) {
      console.debug('Ran out of posts. Scrolling to bottom...')
      _scrollToBottom()
      setTimeout(() => {}, 750)  
    }
    
    return Promise.all(els.map(el => new Promise((resolve, reject) => {
      if (el.firstChild.textContent === 'Like') {
        setTimeout(() => {
          el.click()
          console.debug(`CLICKED -> ${el}`)
          return resolve(el)
        }, _randomTimeout())
      } else {
        console.debug(`Skipped -> ${el}`)
        return resolve(el)
      }
    })))
    .then(res => console.debug(`Resolved ${res}`))
    .catch(err => console.error(err))
  }

  _inject(document)
    .then(() => {
      if (typeof interval === 'number') {
        let idx = start
        const getInterval = () => interval + _randomTimeout()
        const setNewTimeout = () => setTimeout(() => {
          console.debug(`Starting over at ${idx}!`)
          const elsArr = $(selector).toArray()
          _like(elsArr.slice(idx, idx+count))
          idx += count
          setNewTimeout()
        }, getInterval())
        setNewTimeout()
      } else {
        _like($(selector).toArray().slice(start, count))
      }
    })

/// sample usage with ~4 second delay between batches of 3 posts
})(0, 3, 4000)
