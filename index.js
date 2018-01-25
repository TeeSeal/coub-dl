const axios = require('axios')

async function fetchCoub(url) {
  const id = url.split('/').slice(-1)[0]
  const mp4 = await axios
    .get(`http://coub.com/api/v2/coubs/${id}`)
    .then(res => res.data.file_versions.html5.video.high.url)
    .catch(() => null)

  if (!mp4) return null

  const { data } = await axios.get(mp4, { responseType: 'arraybuffer' })
  data[0] = data[1] = 0
  return data
}

module.exports = fetchCoub
