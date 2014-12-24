util = require("util")
request = require("request")

pushServiceUrl = rootRequire("src/config.js").pushServiceUrl
accessTokens = rootRequire("src/config.js").accounts.map((account) ->
  return account.accessToken
)
assembleMessengeTitle = (result) ->
  title = util.format("id %s on site %s is available", result.id, result.site)
  return title

assembleMessengeBody = (result) ->
  body =  util.format("Title: %s\n", result.title)
  body += util.format("Url: %s\n", result.url)
  body += util.format("Price: %s        full price: %s\n", result.price, result.fullPrice)
  body += util.format("Discount: %s\% OFF\n", Math.round(result.discount))
  body += util.format("Review: %s\n", result.review)
  body += util.format("Instore: %s\n", result.instore? "yes" : "no")
  if 0 < result.benefits.length
    result.benefits.forEach((benefit, idx) ->
      body += util.format("Benefit%s: %s\n", idx, benefit)
      return
    )
  else
    body += "Benefits: none\n"
  return body

class Messenger
  constructor: ->
  push: (result) ->
    logger.debug("id %s site %s to be pushed", result.id, result.site)
    messenge =
      type: 'note'
      title: assembleMessengeTitle(result)
      body: assembleMessengeBody(result)

    accessTokens.map((token) ->
      postOptions =
        url: pushServiceUrl
        auth:
          user: token
        headers:
          'content-type': 'application/json'
        body: JSON.stringify(messenge)
      request.post(postOptions, (err, res, body) ->
        shortToken = token.slice(0, 7)
        if not err and res.statusCode == 200
          logger.info("push message to user %s ok.", shortToken)
        else if res.statusCode != 200
          errorResponseHandler(shortToken, err, res, body)
        else
          failedRequestHandler(shortToken, err, res, body)
        return
      )
    )
    return

  errorResponseHandler: (token, err, res, body) ->
    logger.error("messenger response error.")
    logger.error("token %s response status code: %s", token, res.statusCode)
    logger.error("token %s body: %s", token, body)
    return
  failedRequestHandler: (token, err, res, body) ->
    logger.error("messenger request failed.")
    logger.error("token %s, error %s", token, err)
    return

module.exports = Messenger