import crypto from 'crypto'

interface SignatureOptions {
  method: string
  url: string
  accessKeyId: string
  secretAccessKey: string
  body?: Buffer
  contentType?: string
  region?: string
  amzDate?: string
  dateStamp?: string
}

export async function createSignature(options: SignatureOptions): Promise<string> {
  const {
    method,
    url,
    accessKeyId,
    secretAccessKey,
    body,
    contentType = 'application/octet-stream',
    region = 'auto',
    amzDate: passedAmzDate,
    dateStamp: passedDateStamp
  } = options

  const urlObj = new URL(url)
  const host = urlObj.hostname
  const path = urlObj.pathname
  const service = 's3'
  
  // Use passed timestamps or create new ones
  const now = new Date()
  const amzDate = passedAmzDate || now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = passedDateStamp || amzDate.substr(0, 8)

  // Create canonical request
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${host}`,
    `x-amz-content-sha256:${getPayloadHash(body)}`,
    `x-amz-date:${amzDate}`
  ].join('\n')

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    method,
    path,
    '', // query string
    canonicalHeaders,
    '', // blank line
    signedHeaders,
    getPayloadHash(body)
  ].join('\n')

  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256(canonicalRequest)
  ].join('\n')

  // Calculate signature
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service)
  const signature = hmacSha256(signingKey, stringToSign).toString('hex')

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  return authorizationHeader
}

function getPayloadHash(body?: Buffer): string {
  if (!body) return sha256('')
  return crypto.createHash('sha256').update(body).digest('hex')
}

function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data).digest()
}

function getSignatureKey(secretKey: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp)
  const kRegion = hmacSha256(kDate, regionName)
  const kService = hmacSha256(kRegion, serviceName)
  const kSigning = hmacSha256(kService, 'aws4_request')
  return kSigning
}