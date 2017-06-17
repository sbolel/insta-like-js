/**
 * @desc Injects jQuery into Instagram hashtags page and likes 1 post at a time
 *
 * Usage: Open https://www.instagram.com/explore/tags/javascript/ in Chrome;
 *        run this script in the JS console to like top posts one-at-a-time.
 * @param {number} start - starting post index (should be 0 unless manually continuing a prev. exec.)
 * @param {number} interval - number of milliseconds to wait between batches, +/- some randomness
 */
(function(start, interval) {
  const count = 1       // override count, we can only view 1 post at a time for tags.
  const selector = 'a'  // this works since we know the structure of the page.

  const _body = () => document.getElementsByTagName('body')[0]
  const _getButtons = () => $(selector).toArray()
  const _plusOrMinus = () => Math.random() < 0.5 ? -1 : 1
  const _randomTimeout = () => (_plusOrMinus() * Math.floor((Math.random() * 500))) + 1500
  const _randomTimeoutShort = () => (_plusOrMinus() * Math.floor((Math.random() * 200))) + 1000
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
    var commonClass

    if (!els || typeof els === 'undefined' || els.length < 1) {
      console.log('Ran out of posts...')
      // @todo click the "Load more posts" button
      return
    }
    
    return Promise.all(els.map(el => new Promise((resolve, reject) => {
      el.click()
      setTimeout(() => {
        var e = $('article')[1]
        var btn = e.children[2].firstChild.firstChild.firstChild
        if (btn.classList.contains('coreSpriteLikeHeartOpen')) {
          setTimeout(() => {
            btn.click()
            console.log('CLICKED ->', btn)
          }, _randomTimeout())
        } else {
          console.log('Skipped ->', btn)
        }
        setTimeout(() => {
          $('button').last()[0].click()
          return resolve(e)
        }, _randomTimeoutShort())
      }, _randomTimeout())
    })))
    .then(res => console.log(`Resolved ${res}`))
    .catch(err => console.error(err))
  }

  function _doLike() {
    _inject(document)
      .then(() => {
        if (typeof interval === 'number') {
          let idx = start
          const getInterval = () => interval + _randomTimeout()
          const setNewTimeout = () => setTimeout(() => {
            console.log(`Starting over at ${idx}!`)
            const elsArr = $(selector).toArray()
            commonClass = $(selector)[0].classList[0]
            _like(elsArr.slice(idx, idx+count))
            idx += count
            setNewTimeout()
          }, getInterval())
          setNewTimeout()
        } else {
          _like($(selector).toArray().slice(start, count))
        }
      })
  }

  _doLike()
/// sample usage with ~4 second delay between batches of 3 posts
})(0, 3000)