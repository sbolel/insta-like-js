/**
 * @desc    Inject jQuery in Instagram tag feed document then "Like" posts in series
 * @example Navigate to https://www.instagram.com/explore/tags/javascript/ in Chrome,
 *          and run this script in the JS console to like the top posts one-at-a-time.
 */
(function() {
  const count = 1
  const interval = 3000
  const selector = 'a'
  const start = 0

  const getBody = () => document.getElementsByTagName('body')[0]
  const getButtons = () => $(selector).toArray()
  const getCloseBtn = () => $('button').last()[0]
  const getSign = () => Math.random() < 0.5 ? -1 : 1
  const getShortTimeout = () => Math.floor((Math.random() * 1000))
  const getTimeout = () => (getSign() * Math.floor((Math.random() * 1000))) + interval
  const scrollToBottom = () => getBody().scrollTop = getBody().scrollHeight
  const closePost = () => getCloseBtn().click()

  function inject(cb) {
    return (opts => {
      return Array.isArray(opts)
        ? Promise.all(opts.map(item => this.loadScript(item, opts)))
        : new Promise((resolve, reject) => {
          let r = false
          const t = document.getElementsByTagName('script')[0]
          const s = document.createElement('script')
          if (typeof opts === 'object' && opts.src) for (key in opts) s[key] = opts[key]
          else if (typeof opts === 'string') s.src = opts
          else throw new Error('Script src undefined')
          s.onerror = s.onabort = reject
          s.onload = s.onreadystatechange = () => {
            if (!r && (!this.readyState || this.readyState == 'complete')) {
              r = true
              resolve(s.src)
            }
          }
          t.parentNode.insertBefore(s, t)
        })
    })({async:true,src:'https://code.jquery.com/jquery-3.2.1.min.js',type:'text/javascript'})
    .then(src => console.log('Injected', src))
  }

  function like(els, idx) {
    if (!els || typeof els === 'undefined' || els.length < 1)
      throw new Error('Ran out of posts.')  // @todo click "Load more posts"

    return els.map(el => {
      // open the post by triggering a click on the element
      el.click()

      // get reference to the "Like" button element.
      // click like if not clicked and close, else just close.
      setTimeout(() => {
        let article = $('article')[1]
        let btn = article.children[2].firstChild.firstChild.firstChild
        if (btn.classList.contains('coreSpriteLikeHeartFull')) {
          console.log(`%c 𝗫 Skipped ${idx}`, 'color: #D50000')
          return setTimeout(() => closePost(), getShortTimeout())
        }
        btn.click()
        console.log(`%c ✔ Liked #${idx}!`, 'color: #00C853')
        setTimeout(() => closePost(), getShortTimeout())
      }, getTimeout())
    })
  }

  function main() {
    getBody().scrollTop = 0
    inject().then(() => {
      let idx = start
      const setNewTimeout = () => setTimeout(() => {
        console.log(`Opening post #${idx}...`)
        like($(selector).toArray().slice(idx, idx + count), idx)
        idx += count
        setNewTimeout()
      }, getTimeout()*1.5)
      setNewTimeout()
    })
  }

  main()
})()
