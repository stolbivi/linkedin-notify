export const getQuery = (name: string, url?: string) => {
  const URL = url ? url : window.location.href
  const query = URL.split("?")[1]
  if (query) {
    const params = query.split("&")
    const result = params.find((item) => {
      const itemArr = item.split("=")
      return itemArr[0] === name
    })
    if (result) {
      return result.split("=")[1]
    }
  }
  return ""
}
